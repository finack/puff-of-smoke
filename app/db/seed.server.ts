import fs from "node:fs";
import { parse } from "csv-parse";
import { eq } from "drizzle-orm";

import db, { pool } from "~/db/db.server";
import {
	components,
	devices,
	points,
	projects,
	users,
	wires,
} from "~/db/schema";

async function devicesFromCsv(projectId: string) {
	const parser = fs
		.createReadStream("devices.csv")
		.pipe(parse({ columns: true }));

	for await (const record of parser) {
		if (record.type !== "Device") {
			continue;
		}

		const { id, shortCode, description, ...meta } = record;

		const updatedRecord = {
			shortCode,
			description,
			meta,
		};

		await db
			.insert(devices)
			.values({ ...updatedRecord, projectId })
			.returning();
	}
}

async function seeds() {
	const userId = "2258aded-43b7-474c-b1a4-93ca9a478bee";
	const projectId = "69b1f8a1-8e0b-4900-99f3-50ac4321032a";

	await db.delete(users).where(eq(users.id, userId));

	await db.insert(users).values({
		id: userId,
		firstName: "John",
		lastName: "Doe",
		email: "user@example.com",
		status: "active",
	});

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

	console.log("devs", devs);

	const comp = {
		ibbs: (
			await db
				.insert(components)
				.values({ deviceId: devs.ibbs.id, lablel: "IBBS" })
				.returning()
		)[0],
		gtn_comm: (
			await db
				.insert(components)
				.values({ deviceId: devs.gtn.id, label: "P1003" })
				.returning()
		)[0],
		fuse_1: (
			await db
				.insert(components)
				.values({ deviceId: devs.fuse.id, label: "1" })
				.returning()
		)[0],
	};

	console.log("comp", comp);

	const wire_1 = (
		await db
			.insert(wires)
			.values({ projectId: projectId, type: "power" })
			.returning()
	)[0];
	const wire_2 = (
		await db.insert(wires).values({ projectId: projectId }).returning()
	)[0];

	await db.insert(points).values({
		wireId: wire_1.id,
		componentId: comp.ibbs.id,
		identifier: "12",
		label: "Passthru Power",
		order: 1,
	});

	await db.insert(points).values({
		wireId: wire_1.id,
		componentId: comp.gtn_comm.id,
		identifier: "30",
		label: "Power 2",
		order: 2,
	});
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
