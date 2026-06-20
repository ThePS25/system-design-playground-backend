import type { FlowEdge, FlowNode } from '../types/index.js';

export function buildAdjacencyList(edges: FlowEdge[]): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();

  for (const edge of edges) {
    const targets = adjacency.get(edge.source) ?? [];
    targets.push(edge.target);
    adjacency.set(edge.source, targets);
  }

  return adjacency;
}

export function findEntryNodes(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
  const targets = new Set(edges.map((edge) => edge.target));
  return nodes.filter((node) => !targets.has(node.id));
}

export function collectComponentSlugs(nodes: FlowNode[]): Set<string> {
  return new Set(nodes.map((node) => node.data.componentId));
}

export function traverseGraph(
  startNodeId: string,
  adjacency: Map<string, string[]>,
): string[] {
  const visited = new Set<string>();
  const queue = [startNodeId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);

    const neighbors = adjacency.get(current) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  return Array.from(visited);
}

export function getNodeBySlug(nodes: FlowNode[], slug: string): FlowNode | undefined {
  return nodes.find((node) => node.data.componentId === slug);
}
