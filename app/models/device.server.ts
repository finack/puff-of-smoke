import arc from "@architect/functions";
import { createId } from "@paralleldrive/cuid2";

import type { User } from "./user.server";

export interface Device {
  id: ReturnType<typeof createId>;
  userId: User["id"];
  title: string;
  description: string;
}

interface DeviceItem {
  pk: User["id"];
  sk: `device#${Device["id"]}`;
}

const skToId = (sk: DeviceItem["sk"]): Device["id"] => sk.replace(/^device#/, "");
const idToSk = (id: Device["id"]): DeviceItem["sk"] => `device#${id}`;

export async function getDevice({
    id,
    userId,
  }: Pick<Device, "id" | "userId">): Promise<Device | null> {
    const db = await arc.tables();
  
    const result = await db.device.get({ pk: userId, sk: idToSk(id) });
  
    if (result) {
      return {
        userId: result.pk,
        id: result.sk,
        title: result.title,
        description: result.description,
      };
    }
    return null;
  }
  
  export async function getDeviceListItems({
    userId,
  }: Pick<Device, "userId">): Promise<Pick<Device, "id" | "title">[]> {
    const db = await arc.tables();
  
    const result = await db.device.query({
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": userId },
    });
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.Items.map((n: any) => ({
      title: n.title,
      id: skToId(n.sk),
    }));
  }
  
  export async function createDevice({
    description,
    title,
    userId,
  }: Pick<Device, "description" | "title" | "userId">): Promise<Device> {
    const db = await arc.tables();
  
    const result = await db.device.put({
      pk: userId,
      sk: idToSk(createId()),
      title: title,
      description: description,
    });
    return {
      id: skToId(result.sk),
      userId: result.pk,
      title: result.title,
      description: result.description,
    };
  }
  
  export async function deleteDevice({ id, userId }: Pick<Device, "id" | "userId">) {
    const db = await arc.tables();
    return db.device.delete({ pk: userId, sk: idToSk(id) });
  }