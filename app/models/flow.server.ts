import type { Edge, Node } from "reactflow";

import {
  type Point,
  getAllPointsForDeviceId,
  getPointsForDeviceId,
} from "~/models/point.server";

import type { Device } from "~/models/device.server";

async function generateConnectedNodesAndEdges(connectedPoints: Point[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  return {
    nodes,
    edges,
  };
}

async function generateDeviceNodes(
  device: Device,
  devicePoints: Point[],
): Promise<Node[]> {
  const nodes: Node[] = [];
  const components: Record<string, Point[]> = devicePoints.reduce(
    (component: Record<string, Point[]>, point: Point) => {
      const groupName = point.data.component.name || "default";
      if (!component[groupName]) component[groupName] = [];
      component[groupName].push(point);
      return component;
    },
    {} as Record<string, Point[]>,
  );

  nodes.push({
    id: device.id,
    data: { label: device.shortCode },
    position: { x: 0, y: 0 },
    type: "group",
  });

  for (const component in components) {
    const groupId = `${device.id}-${component}`;
    nodes.push({
      id: groupId,
      data: { label: component },
      position: { x: 0, y: 10 },
      parentId: device.id,
      extent: "parent",
      expandParent: true,
    });

    // Sort points within the group by component id
    const sortedPoints = components[component].sort(
      (a: Point, b: Point) => a.data.component.id - b.data.component.id,
    );

    let yPosition = 10;
    for (const point of sortedPoints) {
      yPosition += 45;
      nodes.push({
        id: point.id,
        data: { label: point.data?.component?.id },
        position: { x: 10, y: yPosition },
        sourcePosition: "right",
        type: "input",
        parentId: groupId,
        expandParent: true,
      });
    }
  }
  return nodes;
}

export async function deviceNodes(device: Device) {
  const devicePoints = await getPointsForDeviceId(device.id);
  const deviceNodes: Node[] = await generateDeviceNodes(device, devicePoints);
  const connectedPoints = await getAllPointsForDeviceId(device.id);
  const { nodes, edges } =
    await generateConnectedNodesAndEdges(connectedPoints);

  return deviceNodes;
}
/*
{
  id: "2",
    data: { label: "Group A" },
  position: { x: 100, y: 100 },
  className: "light",
    style: { backgroundColor: "rgba(255, 0, 0, 0.2)", width: 200, height: 200 },
},
{
  id: "2a",
    data: { label: "Node A.1" },
  position: { x: 10, y: 50 },
  parentId: "2",
  },
{
  id: "4b",
    data: { label: "Group B.A" },
  position: { x: 15, y: 120 },
  className: "light",
    style: {
    backgroundColor: "rgba(255, 0, 255, 0.2)",
      height: 150,
        width: 270,
    },
  type: "group",
    extent: "parent",
      parentId: "4",
  },
{
  id: "4b1",
    data: { label: "Node B.A.1" },
  position: { x: 20, y: 40 },
  className: "light",
    parentId: "4b",
      extent: "parent"
},
  */
