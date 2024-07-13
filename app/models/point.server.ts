import { or, eq, sql } from "drizzle-orm";

import db from "~/db/db.server";
import { points, type Point, segments, type Segment } from "~/db/schema";
export type { Point, NewPoint } from "~/db/schema";

export async function getPointsForDeviceId(deviceId: string) {
  return await db
    .select()
    .from(points)
    .where(eq(points.deviceId, deviceId))
    .orderBy(sql`data->'component'->>'id'`);
}

export async function getPointsByDeviceIdXXX(
  deviceId: string,
): Promise<Point[] | undefined> {
  const query = sql`
  WITH RECURSIVE connected_points AS(
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
  return points;
}

export async function getDeviceConnections(deviceId: string) {
  // Get all points connected to the device, grouped by point.component.name
  const pointsGroupedByName = await db
    .select({
      name: sql`jsonb_extract_path_text(${points.data}, 'component', 'name')`,
      points: sql`jsonb_agg(${points}.id)`,
    })
    .from(points)
    .where(eq(points.deviceId, deviceId))
    .groupBy(sql`jsonb_extract_path_text(${points.data}, 'component', 'name')`);

  const result = await Promise.all(
    pointsGroupedByName.map(async (group) => {
      const pointsWithSegments = await Promise.all(
        group.points.map(async (pointId) => {
          // Get segments and connected points for each point
          const foundSegments = await db
            .select()
            .from(segments)
            .where(
              or(
                eq(segments.startPointId, pointId),
                eq(segments.endPointId, pointId),
              ),
            );

          const connectedPoints = await Promise.all(
            foundSegments.map(async (seg) => {
              const startPoint = await db
                .select()
                .from(points)
                .where(eq(points.id, seg.startPointId))
                .limit(1);
              const endPoint = await db
                .select()
                .from(points)
                .where(eq(points.id, seg.endPointId))
                .limit(1);
              return { seg, startPoint, endPoint };
            }),
          );

          return { pointId, foundSegments, connectedPoints };
        }),
      );

      return { name: group.name, pointsWithSegments };
    }),
  );

  return result;
}

export async function getDeviceConnectionsUnion(deviceId: string) {
  const query = sql`
    WITH RECURSIVE device_points AS(
    SELECT
        p.id AS point_id,
    s.id AS segment_id,
    s.start_point_id,
    s.end_point_id
      FROM
        points p
        LEFT JOIN segments s ON p.id = s.start_point_id OR p.id = s.end_point_id
      WHERE
        p.device_id = ${deviceId}

      UNION

      SELECT
        p.id AS point_id,
    s.id AS segment_id,
    s.start_point_id,
    s.end_point_id
      FROM
        points p
        JOIN segments s ON p.id = s.start_point_id OR p.id = s.end_point_id
        JOIN device_points dp ON dp.point_id = s.start_point_id OR dp.point_id = s.end_point_id
      WHERE
        p.id <> dp.point_id
  )
    SELECT DISTINCT
  dp.point_id,
    dp.segment_id,
    dp.start_point_id,
    dp.end_point_id
  FROM
      device_points dp;
  `;

  const result = await db.execute(query);
  return result;
}

export async function getDeviceConnectionsB(deviceId: string) {
  const query = sql`
    WITH RECURSIVE device_points AS(
    SELECT
      p.id AS point_id,
      s.id AS segment_id,
      s.start_point_id,
      s.end_point_id,
      p.data ->> 'component' AS component_data
      FROM
        points p
        LEFT JOIN segments s ON p.id = s.start_point_id OR p.id = s.end_point_id
      WHERE
        p.device_id = ${deviceId}

      UNION

      SELECT
        p.id AS point_id,
    s.id AS segment_id,
    s.start_point_id,
    s.end_point_id,
    p.data ->> 'component' AS component_data
      FROM
        points p
        JOIN segments s ON p.id = s.start_point_id OR p.id = s.end_point_id
        JOIN device_points dp ON dp.point_id = s.start_point_id OR dp.point_id = s.end_point_id
      WHERE
        p.id <> dp.point_id
  )
    SELECT DISTINCT
  dp.point_id,
    dp.segment_id,
    dp.start_point_id,
    dp.end_point_id,
    dp.component_data
  FROM
      device_points dp;
  `;

  const result = await db.execute(query);
  return result.rows;
}
