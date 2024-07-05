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

  const devs = {
    fuse: await db.query.devices.findFirst({
      where: eq(devices.shortCode, "FUSE"),
    }),
    ibbs: await db.query.devices.findFirst({
      where: eq(devices.shortCode, "IBBS"),
    }),
    gtn: await db.query.devices.findFirst({
      where: eq(devices.shortCode, "GTN"),
    }),
    gdu: await db.query.devices.findFirst({
      where: eq(devices.shortCode, "GDU"),
    }),
  };
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
