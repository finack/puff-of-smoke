import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { deleteDevice, getDeviceData } from "~/models/device.server";
import { requireUserId } from "~/session.server";
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.deviceId, "deviceId not found");

  const device = await getDeviceData({ id: params.deviceId, userId });
  if (!device) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ device });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.deviceId, "deviceId not found");

  await deleteDevice({ id: params.deviceId, userId });

  return redirect("/devices");
};

// Device Component
const Device = ({ name, connectors }) => (
  <div className="device">
    {connectors.map((connector, index) => (
      <Connector key={index} {...connector} />
    ))}
  </div>
);

// Connector Component
const Connector = ({ name, pins }) => (
  <div className="connector">
    <h3>{name}</h3>
    {pins.map((pin, index) => (
      <Pin key={index} {...pin} />
    ))}
  </div>
);

// Pin Component
const Pin = ({ name, label, wires, id }) => (
  <div className="pin" id={`pin-${id}`}>
    {label} {name}
    {wires.map((wire, index) => (
      <Wire key={index} {...wire} />
    ))}
  </div>
);

// Wire Component
const Wire = ({ fromPin, toPin }) => (
  <div className="wire" style={calculateWirePosition(fromPin, toPin)}></div>
);

// Function to calculate wire position (simplified)
const calculateWirePosition = (fromPin, toPin) => {
  const fromElement = document.getElementById(`pin-${fromPin}`);
  const toElement = document.getElementById(`pin-${toPin}`);
  // Calculate the position and return the style object
  // ...
};

export default function DeviceDetailsPage() {
  const data = useLoaderData<typeof loader>();

  const handleDelete = (e: { preventDefault: () => void }) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this device?",
    );
    if (!isConfirmed) {
      e.preventDefault(); // Prevents the form from submitting if the user cancels
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">{data.device.name}</h3>
        <Form
          method="post"
          className="flex items-center"
          onSubmit={handleDelete}
        >
          <button
            type="submit"
            className="bg-transparent text-red-500 hover:text-red-600 focus:text-red-400 text-2xl"
          >
            &minus;
          </button>
        </Form>
      </div>
      <p className="text-sm py-2">{data.device.description}</p>
      <hr className="my-4" />
      <Device {...data.device} />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Note not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
