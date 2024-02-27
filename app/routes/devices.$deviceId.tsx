import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { DefaultNodeModel, DefaultPortModel, PortModelAlignment } from "@projectstorm/react-diagrams";

import createDiagram from "~/components/diagram";
import type { DiagramData } from "~/components/diagram";

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

function x(diagramData: DiagramData, device: any, connector: any, pin: any, wire: any) {
  let nodeId = `${device.id}-${connector.id}`;
  var node = diagramData["nodes"][nodeId];

  if (!node) {
    node = new DefaultNodeModel({
      name: connector.name,
    });
    diagramData.nodes[nodeId] = node;
  }

  let portId = `${nodeId}-${pin.id}`;
  var port = diagramData["ports"][portId];

  if (!port) {
    port = new DefaultPortModel({
      name: pin.name,
      alignment: PortModelAlignment.RIGHT,
    });
    diagramData.ports[portId] = port;
  }
  node.addPort(port);

  let wireId = `${portId}-${wire.id


}

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

  const diagramData: DiagramData = { nodes: {}, ports: {} };

  data.device.connectors.forEach((connector) => {
    // Create the ports
    connector.pins.forEach((pin) => {
      const port = new DefaultPortModel({
        name: pin.name,
        alignment: PortModelAlignment.RIGHT,
      });
      node.addPort(port);
      diagramData.ports[`${nodeId}-${pin.name}`] = port;

      pin.wires.forEach((wire) => {
        const rightPin = wire.pin
        const rightConnector = rightPin.connector
        const rightDevice = rightConnector.device

    });

    // Create the links
    connector.pins.forEach((pin) => {
      pin.connector.forEach((connection: { connectorId: string | number; pinName: any; }) => {
        const sourcePort = diagramData.ports[`${nodeId}-${pin.name}`];
        const targetPort = diagramData.ports[`${connection.connectorId}-${connection.pinName}`];
        const link = sourcePort.link<DefaultLinkModel>(targetPort);
        diagramData.nodes[connection.connectorId].addLink(link);
      });
    });


  })

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
