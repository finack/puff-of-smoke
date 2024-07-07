import fs from "node:fs";
import { parse } from "csv-parse";
import { eq } from "drizzle-orm";

import db, { pool } from "~/db/db.server";
import { devices, points, projects, segments, users } from "~/db/schema";

import { createUser, deleteUserByEmail } from "~/models/user.server";

async function devicesFromCsv(projectId: string) {
  const parser = fs
    .createReadStream("devices.csv")
    .pipe(parse({ columns: true }));

  for await (const record of parser) {
    if (record.type !== "Device") {
      continue;
    }

    const {
      id,
      shortCode,
      description,
      vendor,
      model,
      url,
      partNumber,
      cost,
      ...meta
    } = record;

    const updatedRecord = {
      shortCode,
      description,
      data: {
        vendor: {
          name: vendor,
          model,
          url,
          partNumber,
          price: cost,
        },
        meta,
      },
    };

    await db
      .insert(devices)
      .values({ ...updatedRecord, projectId })
      .returning();
  }
}

async function getDeviceId(
  shortName: string,
): Promise<{ shortName: string; id: string }> {
  const results = await db.query.devices.findFirst({
    columns: { id: true },
    where: eq(devices.shortCode, shortName),
  });

  if (!results) {
    throw new Error(`Device not found: ${shortName}`);
  }

  return { shortName: shortName.toLowerCase(), id: results.id };
}

async function getDeviceIds(
  shortNames: string[],
): Promise<{ [key: string]: string }> {
  const devsArray = await Promise.all(shortNames.map(getDeviceId));

  return devsArray.reduce((acc: { [key: string]: string }, dev) => {
    acc[dev.shortName] = dev.id;
    return acc;
  }, {});
}

async function createPoint(
  id: string,
  name: string,
  componentId: string,
  label: string,
  componentName: string,
  // biome-ignore lint/style/noInferrableTypes:
  usePointId: boolean = false,
): Promise<{ [key: string]: string }> {
  const [results] = await db
    .insert(points)
    .values({
      ...(usePointId ? { pointId: id } : { deviceId: id }),
      data: {
        component: { id: componentId, label, name: componentName },
      },
    })
    .returning();
  return { [name]: results.id };
}

async function createPoints(
  pointsToBeCreated: (string | number | boolean)[][],
): Promise<{ [key: string]: string }> {
  const pointsPromises = pointsToBeCreated.map(
    ([id, name, componentId, label, componentName, usePointId]) =>
      createPoint(
        id as string,
        name as string,
        componentId as string,
        label as string,
        componentName as string,
        usePointId as boolean,
      ),
  );
  const pointsArray = await Promise.all(pointsPromises);

  return pointsArray.reduce((acc: { [key: string]: string }, point) => {
    // biome-ignore lint/performance/noAccumulatingSpread:
    return { ...acc, ...point };
  }, {});
}

async function createSegment(
  name: string,
  startPointId: string,
  endPointId: string,
): Promise<{ [key: string]: string }> {
  if (!startPointId || !endPointId) {
    console.log("createSegement:", name, startPointId, endPointId);
    return { [name]: "Invalid start or end point ID" };
  }

  try {
    const [results] = await db
      .insert(segments)
      .values({
        startPointId,
        endPointId,
      })
      .returning();
    return { [`${startPointId}-${endPointId}`]: results.id };
  } catch (error) {
    return { [name]: String(error) };
  }
}

async function createSegments(
  segmentsToBeCreated: string[][],
): Promise<{ [key: string]: string }> {
  const segmentsPromises = segmentsToBeCreated.map(
    ([name, startPointId, endPointId]) =>
      createSegment(name, startPointId, endPointId),
  );
  const segmentsArray = await Promise.all(segmentsPromises);

  return segmentsArray.reduce((acc: { [key: string]: string }, segment) => {
    // biome-ignore lint/performance/noAccumulatingSpread:
    return { ...acc, ...segment };
  }, {});
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

  await devicesFromCsv(projectId);

  const devs = await getDeviceIds([
    "ADAHR",
    "BRK",
    "EIS",
    "FUSE",
    "GTN",
    "GND",
    "IBBS",
    "NDIA",
    "PFD",
    "MAGNT",
  ]);
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
  let pts = await createPoints(pointsToBeCreated);
  const joinPtsToBeCreated = [
    [pts.fuse0_1, "fuse_j_1", "", "Join Fuse 0: 1 & 4", "", true],
    [pts.fuse0_2, "fuse_j_2", "", "Join Fuse 0: 1 & 4", "", true],
    [pts.ibbs6, "ibbs_j_6", "", "Join IBBS 6, 7, 8", "", true],
    [pts.ibbs10, "ibbs_j_10", "", "Join IBBS 10 & 11", "", true],
    [pts.gtn43, "gtn_j_43", "", "Join GTN P1003 43 & 44", "", true],
    [pts.gtn51, "gtn_j_51", "", "Join GTN P1004 51 & 52", "", true],
    [pts.gtn19, "gtn_j_19", "", "Join GTN P1001 19 & 20", "", true],
    [
      pts.adahr22,
      "adahr_j_22",
      "",
      "Joint ADAHR 22, NDIA 8, MAGNT 8, EIS 2",
      "",
      true,
    ],
  ];
  const joinPts = await createPoints(joinPtsToBeCreated);
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
  const segs = await createSegments(segmentsToBeCreated);
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
