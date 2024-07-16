import fs from "node:fs";
import { parse } from "csv-parse";
import { and, eq, or, sql } from "drizzle-orm";

import db, { pool } from "~/db/db.server";
import { type Node, edges, nodes, projects, users } from "~/db/schema";

import { createUser, deleteUserByEmail } from "~/models/user.server";

async function devicesFromCsv(projectId: string) {
  const parser = fs
    .createReadStream("devices.csv")
    .pipe(parse({ columns: true }));

  const shortNameToId: { [key: string]: string } = {};

  for await (const row of parser) {
    if (row.type !== "Device") {
      continue;
    }

    const { shortName, description, vendor, model, url, partNumber, cost } =
      row;

    const deviceKindData = {
      kind: "device" as const,
      vendor: {
        name: vendor,
        model,
        url,
        partNumber,
        price: cost,
      },
    };

    const [results] = await db
      .insert(nodes)
      .values({
        name: shortName,
        description,
        kind: "device",
        projectId,
        kindData: deviceKindData,
      })
      .returning();

    shortNameToId[shortName.toLowerCase()] = results.id;
  }
  return shortNameToId;
}

async function getComponentId(deviceId: string, connectorName: string) {
  const [results] = await db
    .select()
    .from(edges)
    .innerJoin(nodes, or(eq(nodes.id, edges.nodeA), eq(nodes.id, edges.nodeB)))
    .where(
      and(
        or(eq(edges.nodeA, deviceId), eq(edges.nodeB, deviceId)),
        eq(nodes.kind, "connector"),
        eq(nodes.name, connectorName),
      ),
    )
    .limit(1);

  return results?.nodes?.id ?? null;
}

async function createComponent(
  projectId: string,
  deviceId: string,
  name: string,
) {
  const kind = "connector" as const;

  const connectorId = await db.transaction(async (tx) => {
    const [connector] = await tx
      .insert(nodes)
      .values({ projectId, kind, name, kindData: { kind } })
      .returning();
    await tx.insert(edges).values({ nodeA: deviceId, nodeB: connector.id });
    return connector.id;
  });

  return connectorId;
}

async function getOrCreateComponentId(
  projectId: string,
  deviceId: string,
  componentName: string,
) {
  const componentId = await getComponentId(deviceId, componentName);
  if (componentId) return componentId;
  return await createComponent(projectId, deviceId, componentName);
}

async function createPoint(
  projectId: string,
  pointName: string,
  pointDescription: string,
  componentId: string,
) {
  const pointId = await db.transaction(async (tx) => {
    const [point] = await tx
      .insert(nodes)
      .values({
        projectId,
        kind: "point",
        name: pointName,
        description: pointDescription,
        kindData: { kind: "point" },
      })
      .returning();
    await tx.insert(edges).values({ nodeA: componentId, nodeB: point.id });
    return point.id;
  });
  return pointId;
}

async function createPoints(projectId: string, pointsToBeCreated: string[][]) {
  const result = {};
  for (const [
    deviceId,
    pointName,
    pointId,
    label,
    componentName,
  ] of pointsToBeCreated) {
    const componentId = await getOrCreateComponentId(
      projectId,
      deviceId,
      componentName,
    );
    const newPointId = await createPoint(
      projectId,
      pointId,
      label,
      componentId,
    );
    result[pointName] = newPointId;
  }
  return result;
}

//     [pts.gtn19, "gtn_j_19", "", "Join GTN P1001 19 & 20"],
async function createJoinPoints(
  projectId: string,
  pointsToBeCreated: string[][],
) {
  const result = {};
  for (const [pointId, pointName, _, label] of pointsToBeCreated) {
    const newPointId = await createPoint(projectId, pointName, label, pointId);
    result[pointName] = newPointId;
  }
  return result;
}

// ["pts.ibbs12-pts.gtn30", pts.ibbs12, pts.gtn30],
async function createEdges(projectId: string, edgesToBeCreated: string[][]) {
  const result = {};
  for (const [edgeName, nodeA, nodeB] of edgesToBeCreated) {
    if (!nodeA || !nodeB) {
      console.log("createEdges: Invalid nodeA or nodeB:", nodeA, nodeB);
      continue;
    }
    const [newEdge] = await db
      .insert(edges)
      .values({ nodeA, nodeB })
      .returning();
    result[edgeName] = newEdge.id;
  }
  return result;
}

async function seeds() {
  // const userId = "2258aded-43b7-474c-b1a4-93ca9a478bee";
  const projectId = "69b1f8a1-8e0b-4900-99f3-50ac4321032a";

  await deleteUserByEmail("user@example.com");

  const [user] = await createUser("user@example.com", "helloworld");

  const userId = user.id;

  await db.insert(projects).values({
    id: projectId,
    name: "Project 1",
    ownerId: userId,
    isDefault: true,
  });

  const devs = await devicesFromCsv(projectId);
  console.log("devs:", devs);

  const pointsToBeCreated = [
    [devs.ibbs, "ibbs12", "12", "Passthru Output", "default"],
    [devs.ibbs, "ibbs13", "13", "Passthru Output", "default"],
    [devs.ibbs, "ibbs14", "14", "Passthru Output", "default"],
    [devs.ibbs, "ibbs15", "15", "Passthru Output", "default"],
    [devs.ibbs, "ibbs2", "2", "Battery Info", "default"],
    [devs.ibbs, "ibbs3", "3", "Low Volt Warning", "default"],
    [devs.ibbs, "ibbs5", "5", "Power In, Charge, Sensing", "default"],
    [devs.ibbs, "ibbs6", "6", "Passthru Input", "default"],
    [devs.ibbs, "ibbs7", "7", "Passthru Input", "default"],
    [devs.ibbs, "ibbs8", "8", "Passthru Input", "default"],
    //todo join 6,7,8 together
    [devs.ibbs, "ibbs1", "1", "Enable Switch", "default"],
    [devs.ibbs, "ibbs9", "9", "Ground", "default"],
    [devs.ibbs, "ibbs10", "10", "Ground", "default"],
    [devs.ibbs, "ibbs11", "11", "Ground", "default"],
    //todo join 10, 11 together

    [devs.gtn, "gtn30", "30", "Power 2", "P1003"],
    [devs.gtn, "gtn43", "43", "Power 2", "P1003"],
    [devs.gtn, "gtn44", "44", "Power 2", "P1003"],
    [devs.gtn, "gtn51", "51", "Power 2", "P1004"],
    [devs.gtn, "gtn52", "52", "Power 2", "P1004"],
    [devs.gtn, "gtn19", "19", "Power 2", "P1001"],
    [devs.gtn, "gtn20", "20", "Power 2", "P1001"],
    [devs.gtn, "gtn52", "19", "Power 2", "P1001"],

    [devs.mfd, "pfd31", "31", "Power 2", "P4602"],

    [devs.adahr, "adahr22", "8", "Power 2", "J251"],

    [devs.ndia, "ndia22", "8", "Power 2", "J291"],

    [devs.magnt, "magnt8", "8", "Power 2", "J111"],

    [devs.eis, "eis2", "2", "Power 2", "J241"],
    [devs.eis, "eis28", "28", "Volts 2", "J244"],
    [devs.eis, "eis40", "40", "Discrete In 1", "J244"],

    [devs.brk, "brk1", "1", "AUX BATT", "0"],
    [devs.brk, "brk2", "2", "AUX PASSTHRU", "0"],
    [devs.gnd, "gnd1", "1", "IBBS Enable Switch", "0"],
    [devs.gnd, "gnd2", "2", "IBBS Power", "0"],
    [devs.gnd, "gnd3", "3", "IBBS Power", "0"],

    [devs.fuse, "fuse0_1", "1", "IBBS Passthru", "0"],
    [devs.fuse, "fuse0_2", "2", "IBBS Passthru", "0"],
    [devs.fuse, "fuse0_3", "3", "IBBS Passthru", "0"],
    [devs.fuse, "fuse0_4", "4", "IBBS Passthru", "0"],
    [devs.fuse, "fuse1_1", "1", "GTN Nav Power 2", "1"],
    [devs.fuse, "fuse1_2", "2", "GTN GPS Power 2", "1"],
    [devs.fuse, "fuse1_3", "3", "PFD Power 2", "1"],
    [devs.fuse, "fuse1_4", "4", "ADAHR NDIA MAGNT EIS Power 2", "1"],
  ];

  let pts = await createPoints(projectId, pointsToBeCreated);

  const joinPtsToBeCreated = [
    [pts.fuse0_1, "fuse_j_1", "", "Join Fuse 0: 1 & 4"],
    [pts.fuse0_2, "fuse_j_2", "", "Join Fuse 0: 1 & 4"],
    [pts.ibbs6, "ibbs_j_6", "", "Join IBBS 6, 7, 8"],
    [pts.ibbs10, "ibbs_j_10", "", "Join IBBS 10 & 11"],
    [pts.gtn43, "gtn_j_43", "", "Join GTN P1003 43 & 44"],
    [pts.gtn51, "gtn_j_51", "", "Join GTN P1004 51 & 52"],
    [pts.gtn19, "gtn_j_19", "", "Join GTN P1001 19 & 20"],
    [pts.adahr22, "adahr_j_22", "", "Joint ADAHR 22, NDIA 8, MAGNT 8, EIS 2"],
  ];
  const joinPts = await createJoinPoints(projectId, joinPtsToBeCreated);
  pts = { ...pts, ...joinPts };
  console.log("pts:", pts);

  const segmentsToBeCreated = [
    ["pts.ibbs12-pts.gtn30", pts.ibbs12, pts.gtn30],

    ["pts.ibbs13-pts.gtn_j_43", pts.ibbs13, pts.gtn_j_43],
    ["pts.gtn_j_43-pts.gtn43", pts.gtn_j_43, pts.gtn43],
    ["pts.gtn_j_43-pts.gtn44", pts.gtn_j_43, pts.gtn44],

    ["pts.ibbs_14-pts.fuse_j_1", pts.ibbs14, pts.fuse_j_1],
    ["pts.fuse_j_1-pts.fuse_0_1", pts.fuse_j_1, pts.fuse0_1],
    ["pts.fuse_j_1-pts.fuse_0_4", pts.fuse_j_1, pts.fuse0_4],
    ["pts.fuse_1_1-pts.gtn_j_51", pts.fuse1_1, pts.gtn_j_51],
    ["pts.gtn_j_51-pts.gtn_51", pts.gtn_j_51, pts.gtn51],
    ["pts.gtn_j_51-pts.gtn_52", pts.gtn_j_51, pts.gtn52],
    ["pts.fuse_1_3-pts.adahr_j_22", pts.fuse1_3, pts.adahr_j_22],
    ["pts.adahr_j_22-pts.adahr_22", pts.adahr_j_22, pts.adahr22],
    ["pts.adahr_j_22-pts.ndia_22", pts.adahr_j_22, pts.ndia22],
    ["pts.adahr_j_22-pts.mgnt_8", pts.adahr_j_22, pts.magnt8],
    ["pts.adahr_j_22-pts.eis_2", pts.adahr_j_22, pts.eis2],

    ["pts.ibbs_15-pts.fuse_j_2", pts.ibbs15, pts.fuse_j_2],
    ["pts.fuse_j_2-pts.fuse_0_2", pts.fuse_j_2, pts.fuse0_2],
    ["pts.fuse_j_2-pts.fuse_0_3", pts.fuse_j_2, pts.fuse0_3],
    ["pts.fuse_1_2-pts.gtn_j_19", pts.fuse1_2, pts.gtn_j_19],
    ["pts.gtn_j_19-pts.gtn_19", pts.gtn_j_19, pts.gtn19],
    ["pts.gtn_j_19-pts.gtn_20", pts.gtn_j_19, pts.gtn20],
    ["pts.fuse_1_3-pts.pfd_31", pts.fuse1_3, pts.pfd31],

    ["pts.ibbs_2-pts.eis_28", pts.ibbs2, pts.eis28],

    ["pts.ibbs_3-pts.eis_40", pts.ibbs3, pts.eis40],

    ["pts.ibbs_5-pts.brk_1", pts.ibbs5, pts.brk1],

    ["pts.ibbs_6-pts.ibbs_j_6", pts.ibbs6, pts.ibbs_j_6],
    ["pts.ibbs_7-pts.ibbs_j_6", pts.ibbs7, pts.ibbs_j_6],
    ["pts.ibbs_7-pts.ibbs_j_6", pts.ibbs7, pts.ibbs_j_6],
    ["pts.ibbs_j_6-pts.brk_2", pts.ibbs_j_6, pts.brk2],

    ["pts.ibbs_1-pts.gnd_1", pts.ibbs1, pts.gnd1],

    ["pts.ibbs_9-pts.gnd_2", pts.ibbs9, pts.gnd2],

    ["pts.ibbs_10-pts.ibbs_j_10", pts.ibbs10, pts.ibbs_j_10],
    ["pts.ibbs_11-pts.ibbs_j_10", pts.ibbs11, pts.ibbs_j_10],
    ["pts.ibbs_j_10-pts.gnd_3", pts.ibbs_j_10, pts.gnd3],
  ];
  const edgs = await createEdges(projectId, segmentsToBeCreated);
  console.log("edgs:", edgs);
}
async function runSeed() {
  try {
    await seeds();
  } catch (error) {
    console.error("Failed to seed DB:", error);
  } finally {
    await pool.end();
    console.log("Database connection closed.");
  }
}

runSeed().then(() => {
  console.log("Seeding complete.");
  process.exit(0);
});
