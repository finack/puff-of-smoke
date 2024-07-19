import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import type { DeviceNodeKind, Node } from "~/db/schema";
import { getDevices } from "~/models/device.server";
import { getProjectId, requireUser } from "~/session.server";

import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";

import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from "~/components/dropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/table";
import { Text } from "~/components/text";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUser(request);
  const projectId: string = await getProjectId(request);

  const devices = await getDevices(projectId);
  return json({ devices });
};

function getKindData(node: Pick<Node, "kind" | "kindData">): DeviceNodeKind {
  if (!node) throw new Error("Node is null");

  if (node.kindData?.kind !== "device")
    throw new Error("Node kind is not device");

  return node.kindData;
}

export default function Devices() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="mb-6 text-base font-semibold">Devices</h1>
        <Text>TODO Add Device</Text>
      </header>

      <Table className="[--gutter:theme(spacing.6)] sm:[--gutter:theme(spacing.8)]">
        <TableHead>
          <TableRow>
            <TableHeader className="text-right">Short Name</TableHeader>
            <TableHeader>Device</TableHeader>
            <TableHeader />
          </TableRow>
        </TableHead>
        <TableBody>
          {data.devices.map((device) => {
            const data = getKindData(device);
            return (
              <TableRow key={device.id} href={`/devices/${device.id}`}>
                <TableCell className="text-right font-bold text-zinc-200">
                  {device.name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">
                        {data?.vendor?.name} {data?.vendor?.model}
                      </div>
                      <div className="text-zinc-500">{device.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="-mx-3 -my-1.5 sm:-mx-2.5">
                    <Dropdown>
                      <DropdownButton plain aria-label="More options">
                        <EllipsisHorizontalIcon />
                      </DropdownButton>
                      <DropdownMenu anchor="bottom end">
                        <DropdownItem>Edit</DropdownItem>
                        <DropdownItem>Delete</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
