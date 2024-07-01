import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getDevices } from "~/models/device.server";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/table";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import {
	Dropdown,
	DropdownButton,
	DropdownItem,
	DropdownMenu,
} from "~/components/dropdown";

import { Link } from "~/components/link";
import { Text } from "~/components/text";

export const loader = async () => {
	// const userId = "2258aded-43b7-474c-b1a4-93ca9a478bee"
	const projectId = "69b1f8a1-8e0b-4900-99f3-50ac4321032a";

	const devices = await getDevices({ projectId });
	return json({ devices });
};

export default function Devices() {
	const data = useLoaderData<typeof loader>();

	return (
		<>
			<header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
				<h1 className="mb-6 text-base font-semibold">Devices</h1>
				<Text>Add Device</Text>
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
					{data.devices.map((device) => (
						<TableRow key={device.id} href={`/device/${device.id}/wires`}>
							<TableCell className="text-right font-bold text-zinc-200">
								{device.shortCode}
							</TableCell>
							<TableCell>
								<div className="flex items-center gap-4">
									<div>
										<div className="font-medium">
											{device.data?.vendor?.name} {device.data?.vendor?.model}
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
					))}
				</TableBody>
			</Table>
		</>
	);
}
