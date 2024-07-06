import { asc, eq } from "drizzle-orm";

import db from "~/db/db.server";

import { type Device, devices } from "~/db/schema";

export type { Device };

export async function getDeviceById(
  deviceId: Device["id"],
): Promise<Device | undefined> {
  return db.query.devices.findFirst({ where: eq(devices.id, deviceId) });
}

export async function getDevices(
  projectId: Device["projectId"],
): Promise<Device[]> {
  return db.query.devices.findMany({
    where: eq(devices.projectId, projectId),
    orderBy: [asc(devices.shortCode)],
  });
}
