// export type { Connector, Pin, Wire } from "@prisma/client";

import createEngine, {
  DiagramModel,
  DefaultNodeModel,
  DefaultLinkModel,
  DefaultPortModel,
  PortModelAlignment,
} from "@projectstorm/react-diagrams";

export type NodeData = {
  id: string;
  type: string;
  name: string;
  color: string;
  pins: PinData[];
};

type PinData = {
  name: string;
  in: boolean;
};

export type LinkData = {
  source: string;
  target: string;
  sourcePort: string;
  targetPort: string;
};

export type DiagramData = {
  nodes: { [key: string]: DefaultNodeModel };
  ports: { [key: string]: DefaultPortModel };
};

function createDiagramData(jsonData: string): DiagramData {
  const diagramData: DiagramData = { nodes: {}, ports: {} };
  return diagramData;
}

export default function createDiagram(jsonData: string) {
  const engine = createEngine();
  const model = new DiagramModel();

  const nodes: { [key: string]: DefaultNodeModel } = {};
  const ports: { [key: string]: DefaultPortModel } = {};

  const diagramData: DiagramData = createDiagramData(jsonData);

  diagramData.nodes.forEach((nodeData: NodeData) => {
    const node = new DefaultNodeModel({
      name: nodeData.name,
      color: nodeData.color,
    });
    // node.setPosition(nodeData.position.x, nodeData.position.y);
    nodeData.pins.forEach((portData: PinData) => {
      node.addPort(
        new DefaultPortModel({
          in: portData.in,
          name: portData.name,
          alignment: portData.in
            ? PortModelAlignment.LEFT
            : PortModelAlignment.RIGHT,
        }),
      );
    });

    nodes[nodeData.id] = node;
    model.addNode(node);
  });

  diagramData.links.forEach((linkData: LinkData) => {
    const link = new DefaultLinkModel();
    const sourceNode = nodes[linkData.source];
    const targetNode = nodes[linkData.target];

    const sourcePort = sourceNode.getPort(linkData.sourcePort);
    const targetPort = targetNode.getPort(linkData.targetPort);

    link.setSourcePort(sourcePort!);
    link.setTargetPort(targetPort!);

    model.addLink(link);
  });

  engine.setModel(model);
  return engine;
}
