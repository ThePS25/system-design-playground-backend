import type { IComponent } from '../../models/Component.model.js';
import type { FlowEdge, FlowNode } from '../../types/index.js';
import { buildAdjacencyList, findEntryNodes } from '../../utils/graph.utils.js';

const DEFAULT_SIMULATION = {
  baseCapacityRps: 50000,
  cpuPerRps: 0.002,
  memoryMbBase: 256,
  memoryPerRps: 0.005,
  latencyMsBase: 5,
  latencyPerRpsFactor: 0.0002,
  fanOut: 1,
};

export function getComponentSimulationMeta(component: IComponent | undefined) {
  return component?.simulation ?? DEFAULT_SIMULATION;
}

export function distributeLoad(
  nodes: FlowNode[],
  edges: FlowEdge[],
  rps: number,
  componentMap: Map<string, IComponent>,
  disabledComponents: Set<string>,
): Map<string, number> {
  const loadMap = new Map<string, number>();
  const adjacency = buildAdjacencyList(edges);
  const entryNodes = findEntryNodes(nodes, edges);

  for (const node of nodes) {
    loadMap.set(node.id, 0);
  }

  const queue: Array<{ nodeId: string; load: number }> = entryNodes.map((node) => ({
    nodeId: node.id,
    load: rps,
  }));

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const node = nodes.find((n) => n.id === current.nodeId);
    if (!node) continue;

    const slug = node.data.componentId;
    if (disabledComponents.has(slug)) continue;

    const existingLoad = loadMap.get(node.id) ?? 0;
    loadMap.set(node.id, existingLoad + current.load);

    const component = componentMap.get(slug);
    const meta = getComponentSimulationMeta(component);
    const fanOut = meta.fanOut ?? 1;
    const downstreamLoad = current.load * fanOut;

    const neighbors = adjacency.get(node.id) ?? [];
    if (neighbors.length === 0) continue;

    const perNeighbor = downstreamLoad / neighbors.length;
    for (const neighborId of neighbors) {
      queue.push({ nodeId: neighborId, load: perNeighbor });
    }
  }

  return loadMap;
}

export function calculateUtilization(load: number, capacity: number): number {
  if (capacity <= 0) return 100;
  return Math.min(100, Math.round((load / capacity) * 100));
}

export function calculateLatency(
  baseLatency: number,
  factor: number,
  utilization: number,
): number {
  const loadMultiplier = 1 + utilization / 100;
  return Math.round(baseLatency * loadMultiplier + factor * utilization);
}

export function calculateCacheHitRate(
  defaultRate: number | undefined,
  utilization: number,
  rps: number,
): number {
  const base = defaultRate ?? 0.85;
  const loadPenalty = Math.min(0.4, (rps / 100000) * 0.15 + utilization / 500);
  return Math.max(0, Math.min(1, base - loadPenalty));
}

export function calculateGlobalCpu(nodeMetrics: Array<{ utilization: number }>): number {
  if (nodeMetrics.length === 0) return 0;
  const total = nodeMetrics.reduce((sum, metric) => sum + metric.utilization, 0);
  return Math.round(total / nodeMetrics.length);
}

export function calculateGlobalMemory(
  nodes: FlowNode[],
  loadMap: Map<string, number>,
  componentMap: Map<string, IComponent>,
): number {
  let totalMemory = 0;
  let maxMemory = 0;

  for (const node of nodes) {
    const component = componentMap.get(node.data.componentId);
    const meta = getComponentSimulationMeta(component);
    const load = loadMap.get(node.id) ?? 0;
    const memory = meta.memoryMbBase + meta.memoryPerRps * load;
    totalMemory += memory;
    maxMemory = Math.max(maxMemory, memory);
  }

  if (maxMemory === 0) return 0;
  return Math.min(100, Math.round((totalMemory / (maxMemory * nodes.length)) * 100));
}
