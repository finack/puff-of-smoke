import type { User, Device } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Device } from "@prisma/client";

export function getDevice({
  id,
  userId,
}: Pick<Device, "id"> & {
  userId: User["id"];
}) {
  return prisma.device.findFirst({
    select: { id: true, name: true, description: true },
    where: { id, userId },
  });
}

export function getDeviceData({
  id,
  userId,
}: Pick<Device, "id"> & {
  userId: User["id"];
}) {
  return prisma.device.findFirst({
    where: { id, userId },
    include: {
      connectors: {
        include: {
          pins: {
            include: {
              wires: {
                include: {
                  wire: true,
                  pin: {
                    include: {
                      connector: {
                        include: {
                          device: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export function getDeviceListItems({ userId }: { userId: User["id"] }) {
  return prisma.device.findMany({
    where: { userId },
    select: { id: true, name: true, description: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createDevice({
  name,
  description,
  userId,
}: Pick<Device, "name" | "description"> & {
  userId: User["id"];
}) {
  return prisma.device.create({
    data: {
      name,
      description,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteDevice({
  id,
  userId,
}: Pick<Device, "id"> & { userId: User["id"] }) {
  return prisma.device.deleteMany({
    where: { id, userId },
  });
}
