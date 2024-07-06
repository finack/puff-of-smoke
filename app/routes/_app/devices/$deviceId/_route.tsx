import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getDeviceById } from "~/models/device.server";
import { requireUser } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const deviceId = params.deviceId;
  if (!deviceId) throw new Error("Missing deviceId");
  await requireUser(request);

  const device = await getDeviceById(deviceId);
  return json({ device });
};

export default function ShowDevice() {
  console.log("ShowDevice");
  const { device } = useLoaderData<typeof loader>();
  return <div>{device?.id}</div>;
}
