import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "user@example.com";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("foobar123", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  const garmin_650 = await prisma.device.create({
    data: {
      name: "Garmin 650",
      userId: user.id,
    },
  });

  const connector_p1003 = await prisma.connector.create({
    data: {
      name: "P1003",
      deviceId: garmin_650.id,
    },
  });

  const pin_44 = await prisma.pin.create({
    data: {
      name: "44",
      label: "Power 2",
      connectorId: connector_p1003.id,
    },
  });

  const pin_43 = await prisma.pin.create({
    data: {
      name: "43",
      label: "Power 2",
      connectorId: connector_p1003.id,
    },
  });

  const ibbs = await prisma.device.create({
    data: {
      name: "IBBS",
      userId: user.id,
    },
  });

  const connector_0 = await prisma.connector.create({
    data: {
      name: "0",
      deviceId: ibbs.id,
    },
  });

  const pin_13 = await prisma.pin.create({
    data: {
      name: "13",
      label: "Passthru Output",
      connectorId: connector_0.id,
    },
  });

  const wire_13_43 = await prisma.wire.create({
    data: {
      label: "13-43",
    },
  });

  await prisma.wireConnection.create({
    data: {
      wireId: wire_13_43.id,
      pinId: pin_13.id,
    },
  });

  await prisma.wireConnection.create({
    data: {
      wireId: wire_13_43.id,
      pinId: pin_43.id,
    },
  });

  await prisma.wireConnection.create({
    data: {
      wireId: wire_13_43.id,
      pinId: pin_44.id,
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
