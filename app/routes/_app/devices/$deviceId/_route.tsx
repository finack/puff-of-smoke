import { type LoaderFunctionArgs, json } from "@remix-run/node";
// import { useLoaderData } from "@remix-run/react";
// import { useCallback } from "react";
// import ReactFlow, {
//   addEdge,
//   Background,
//   useNodesState,
//   useEdgesState,
//   MiniMap,
//   Controls,
// } from "reactflow";
import "reactflow/dist/style.css";

import { getDeviceById } from "~/models/device.server";
import { deviceNodes } from "~/models/flow.server";
import { requireUser } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const deviceId = params.deviceId;
  if (!deviceId) throw new Error("Missing deviceId");
  await requireUser(request);

  const device = await getDeviceById(deviceId);
  if (!device) throw new Error("Device not found");
  const initialNodes = await deviceNodes(device);
  console.log("nodes", initialNodes);
  return json({ device, initialNodes });
};

// const initialEdges = [
//   { id: "e1-2", source: "1", target: "2", animated: true },
//   { id: "e1-3", source: "1", target: "3" },
//   { id: "e2a-4a", source: "2a", target: "4a" },
//   { id: "e3-4b", source: "3", target: "4b" },
//   { id: "e4a-4b1", source: "4a", target: "4b1" },
//   { id: "e4a-4b2", source: "4a", target: "4b2" },
//   { id: "e4b1-4b2", source: "4b1", target: "4b2" },
// ];

export default function ShowDevice() {
  // const { initialNodes } = useLoaderData<typeof loader>();
  // const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // const onConnect = useCallback((connection: any) => {
  //   setEdges((eds) => addEdge(connection, eds));
  // }, []);

  return (
    <div className="grow">
      {/* <ReactFlow */}
      {/*   nodes={nodes} */}
      {/*   edges={edges} */}
      {/*   onNodesChange={onNodesChange} */}
      {/*   onEdgesChange={onEdgesChange} */}
      {/*   // onConnect={onConnect} */}
      {/*   className="react-flow-subflows-example" */}
      {/*   fitView */}
      {/* > */}
      {/*   <MiniMap /> */}
      {/*   <Controls /> */}
      {/*   <Background /> */}
      {/* </ReactFlow> */}
    </div>
  );
}
