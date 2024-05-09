import { and, asc, eq } from 'drizzle-orm'

import db from '~/db/db.server'

import { devices, type Device } from '~/db/schema'

export type { Device }

export function getDevices({
  projectId
}: {
  projectId: Device['projectId']
}):
  Promise<Device[]> {
  return db.query.devices.findMany({
    where: eq(devices.projectId, projectId),
    orderBy: [asc(devices.shortCode)],
  })
}
