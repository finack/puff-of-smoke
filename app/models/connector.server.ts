import arc from "@architect/functions";
import { createId } from "@paralleldrive/cuid2";

import type { Device } from "./device.server";

export interface Connector {
  id: ReturnType<typeof createId>;
  deviceId: Device["id"];
  title: string;
}

interface ConnectorItem {
  pk: Device["id"];
  sk: `connector#${Connector["id"]}`;
}

const skToId = (sk: ConnectorItem["sk"]): Connector["id"] => sk.replace(/^connector#/, "");
const idToSk = (id: Device["id"]): ConnectorItem["sk"] => `connector#${id}`;

export async function getConnector({
    id,
    deviceId,
  }: Pick<Connector, "id" | "deviceId">): Promise<Connector | null> {
    const db = await arc.tables();
  
    const result = await db.connector.get({ pk: deviceId, sk: idToSk(id) });
  
    if (result) {
      return {
        deviceId: result.pk,
        id: result.sk,
        title: result.title,
      };
    }
    return null;
  }
  
  export async function getConnectorListItems({
    deviceId,
  }: Pick<Connector, "deviceId">): Promise<Pick<Connector, "id" | "title">[]> {
    const db = await arc.tables();
  
    const result = await db.connector.query({
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": deviceId },
    });
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.Items.map((n: any) => ({
      title: n.title,
      id: skToId(n.sk),
    }));
  }
  
  export async function createConnector({
    title,
    deviceId,
  }: Pick<Connector, "title" | "deviceId">): Promise<Connector> {
    const db = await arc.tables();
  
    const result = await db.connector.put({
      pk: deviceId,
      sk: idToSk(createId()),
      title: title,
    });
    return {
      id: skToId(result.sk),
      deviceId: result.pk,
      title: result.title,
    };
  }
  
  export async function deleteConnector({ id, deviceId }: Pick<Connector, "id" | "deviceId">) {
    const db = await arc.tables();
    return db.connector.delete({ pk: deviceId, sk: idToSk(id) });
  }