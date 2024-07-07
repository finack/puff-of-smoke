import { asc, desc, eq, sql } from "drizzle-orm";

import db from "~/db/db.server";
import type { Point } from "~/db/schema";
export type { Point, NewPoint } from "~/db/schema";

export async function getPointsByDeviceId(
  deviceId: string,
): Promise<Point[] | undefined> {
  const query = sql`
  WITH RECURSIVE connected_points AS (
    SELECT p.id, p.device_id, p.data, p.created_at, p.updated_at
    FROM points p
    WHERE p.device_id = ${deviceId}

    UNION

    SELECT p.id, p.device_id, p.data, p.created_at, p.updated_at
    FROM connected_points cp
    JOIN segments s ON cp.id = s.start_point_id OR cp.id = s.end_point_id
    JOIN points p ON p.id = s.start_point_id OR p.id = s.end_point_id
    WHERE p.id != cp.id
  )
  SELECT * FROM connected_points;
`;

  const queryResult = await db.execute(query);
  const points: Point[] = queryResult.rows.map(
    // biome-ignore lint/suspicious/noExplicitAny:
    (result: any) => result as Point,
  );
  console.log("getPointsByDeviceId: points:", points);
  return points;
}
