import { and, asc, eq } from "drizzle-orm";

import db from "~/db/db.server";

import { type Node, getKindData, nodes } from "~/models/node.server";
export type { Node };

export function getDeviceData(device: Node) {
  getKindData("device", device);
}

export async function getDeviceById(
  deviceId: Node["id"],
): Promise<Node | undefined> {
  return db.query.nodes.findFirst({ where: eq(nodes.id, deviceId) });
}

export async function getDevices(
  projectId: Node["projectId"],
): Promise<Node[]> {
  return db.query.nodes.findMany({
    where: and(eq(nodes.projectId, projectId), eq(nodes.kind, "device")),
    orderBy: [asc(nodes.name)],
  });
}
