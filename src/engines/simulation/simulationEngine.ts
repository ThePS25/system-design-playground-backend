import type { IComponent } from '../../models/Component.model.js';
import type {
  Bottleneck,
  FlowEdge,
  FlowNode,
  GlobalMetrics,
  NodeMetric,
  SimulationResult,
} from '../../types/index.js';
import { BOTTLENECK_THRESHOLDS } from '../../utils/constants.js';
import {
  calculateCacheHitRate,
  calculateGlobalCpu,
  calculateGlobalMemory,
  calculateLatency,
  calculateUtilization,
  distributeLoad,
  getComponentSimulationMeta,
} from './capacityModels.js';

function detectBottlenecks(
  nodeMetrics: NodeMetric[],
  cacheHitRate: number,
  rps: number,
): Bottleneck[] {
  const bottlenecks: Bottleneck[] = [];

  for (const metric of nodeMetrics) {
    if (
      metric.componentSlug === 'database' &&
      metric.utilization >= BOTTLENECK_THRESHOLDS.databaseUtilization
    ) {
      bottlenecks.push({
        type: 'database',
        label: 'Database Bottleneck',
        severity: metric.utilization >= 95 ? 'critical' : 'high',
        affectedNodeIds: [metric.nodeId],
        description: `${metric.label} at ${metric.utilization}% utilization with ${Math.round(metric.requestsPerSecond)} RPS`,
        recommendation: 'Add read replicas, optimize queries, and increase cache hit rate',
      });
    }

    if (
      metric.componentSlug === 'read-replica' &&
      metric.utilization >= BOTTLENECK_THRESHOLDS.readReplicaUtilization
    ) {
      bottlenecks.push({
        type: 'read_replica',
        label: 'Read Replica Saturation',
        severity: 'high',
        affectedNodeIds: [metric.nodeId],
        description: `Read replica ${metric.label} saturated at ${metric.utilization}%`,
        recommendation: 'Add more read replicas or route reads to cache',
      });
    }

    if (
      metric.componentSlug === 'application-server' &&
      metric.utilization >= 90
    ) {
      bottlenecks.push({
        type: 'compute',
        label: 'Compute Bottleneck',
        severity: 'medium',
        affectedNodeIds: [metric.nodeId],
        description: `Application server at ${metric.utilization}% CPU utilization`,
        recommendation: 'Scale horizontally with more application servers',
      });
    }

    if (metric.componentSlug === 'queue' && metric.utilization >= 80) {
      bottlenecks.push({
        type: 'queue',
        label: 'Queue Backlog',
        severity: 'medium',
        affectedNodeIds: [metric.nodeId],
        description: `Message queue depth at ${metric.utilization}% capacity`,
        recommendation: 'Add consumers or increase queue partitions',
      });
    }
  }

  if (cacheHitRate < BOTTLENECK_THRESHOLDS.cacheHitRateMin && rps >= 10000) {
    const cacheNodes = nodeMetrics.filter((m) => m.componentSlug === 'redis');
    bottlenecks.push({
      type: 'cache_miss_storm',
      label: 'Cache Miss Storm',
      severity: cacheHitRate < 0.5 ? 'critical' : 'high',
      affectedNodeIds: cacheNodes.map((n) => n.nodeId),
      description: `Cache hit rate dropped to ${Math.round(cacheHitRate * 100)}% under load`,
      recommendation: 'Increase Redis cluster size, optimize cache keys, add local cache',
    });
  }

  if (rps >= 100000) {
    const dbMetrics = nodeMetrics.filter((m) => m.componentSlug === 'database');
    const maxDbRps = Math.max(...dbMetrics.map((m) => m.requestsPerSecond), 0);
    if (maxDbRps > rps * BOTTLENECK_THRESHOLDS.hotPartitionRatio) {
      bottlenecks.push({
        type: 'hot_partition',
        label: 'Hot Partition',
        severity: 'high',
        affectedNodeIds: dbMetrics.map((m) => m.nodeId),
        description: 'Uneven traffic distribution detected on database partitions',
        recommendation: 'Implement consistent hashing or reshuffle partition keys',
      });
    }
  }

  return bottlenecks;
}

export function runSimulation(
  nodes: FlowNode[],
  edges: FlowEdge[],
  rps: number,
  componentMap: Map<string, IComponent>,
  disabledComponents: string[] = [],
): SimulationResult {
  const disabled = new Set(disabledComponents);
  const loadMap = distributeLoad(nodes, edges, rps, componentMap, disabled);

  const nodeMetrics: NodeMetric[] = nodes.map((node) => {
    const slug = node.data.componentId;
    const component = componentMap.get(slug);
    const meta = getComponentSimulationMeta(component);
    const load = loadMap.get(node.id) ?? 0;
    const isDisabled = disabled.has(slug);

    const utilization = isDisabled
      ? 0
      : calculateUtilization(load, meta.baseCapacityRps);
    const latencyMs = isDisabled
      ? 0
      : calculateLatency(meta.latencyMsBase, meta.latencyPerRpsFactor * 1000, utilization);

    let status: NodeMetric['status'] = 'healthy';
    if (isDisabled) status = 'down';
    else if (utilization >= 95) status = 'saturated';
    else if (utilization >= 75) status = 'degraded';

    return {
      nodeId: node.id,
      componentSlug: slug,
      label: node.data.label,
      utilization,
      latencyMs,
      status,
      requestsPerSecond: isDisabled ? 0 : Math.round(load),
    };
  });

  const cacheNode = nodeMetrics.find((m) => m.componentSlug === 'redis');
  const cacheHitRate = cacheNode
    ? calculateCacheHitRate(
        componentMap.get('redis')?.simulation.cacheHitRateDefault,
        cacheNode.utilization,
        rps,
      )
    : 0.5;

  const activeMetrics = nodeMetrics.filter((m) => m.status !== 'down');
  const cpu = calculateGlobalCpu(activeMetrics);
  const memory = calculateGlobalMemory(nodes, loadMap, componentMap);
  const latencies = activeMetrics.map((m) => m.latencyMs);
  const p99Latency = latencies.length > 0 ? Math.max(...latencies) : 0;
  const throughput = Math.round(rps * (1 - (cpu > 95 ? 0.05 : 0)));
  const queueDepth = Math.max(
    0,
    Math.round(rps * 0.01 * (cpu / 100)),
  );
  const errorRate = cpu > 90 ? 0.015 : cpu > 75 ? 0.005 : 0.001;

  const metrics: GlobalMetrics = {
    cpu,
    memory,
    throughput,
    latency: p99Latency,
    cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    queueDepth,
    errorRate,
  };

  const bottlenecks = detectBottlenecks(nodeMetrics, cacheHitRate, rps);

  return {
    rps,
    metrics,
    nodeMetrics,
    bottlenecks,
    timestamp: new Date().toISOString(),
  };
}
