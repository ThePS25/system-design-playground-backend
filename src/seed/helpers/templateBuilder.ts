import type { FlowEdge, FlowNode } from '../../types/index.js';

interface GraphComponent {
  id: string;
  slug: string;
  label: string;
  x: number;
  y: number;
  type?: 'componentNode' | 'userNode';
}

export function buildGraph(components: GraphComponent[], edges: Array<[string, string, string?]>): {
  nodes: FlowNode[];
  edges: FlowEdge[];
} {
  const nodes: FlowNode[] = components.map((c) => ({
    id: c.id,
    type: c.type ?? (c.slug === 'user' ? 'userNode' : 'componentNode'),
    position: { x: c.x, y: c.y },
    data: { componentId: c.slug, label: c.label },
  }));

  const flowEdges: FlowEdge[] = edges.map(([source, target, label], index) => ({
    id: `e${index + 1}`,
    source,
    target,
    type: 'dataFlow' as const,
    ...(label ? { label } : {}),
  }));

  return { nodes, edges: flowEdges };
}

export const STANDARD_PIPELINE: GraphComponent[] = [
  { id: 'user', slug: 'user', label: 'User', x: 0, y: 200, type: 'userNode' },
  { id: 'dns', slug: 'dns', label: 'DNS', x: 150, y: 200 },
  { id: 'cdn', slug: 'cdn', label: 'CDN', x: 300, y: 80 },
  { id: 'lb', slug: 'load-balancer', label: 'Load Balancer', x: 300, y: 200 },
  { id: 'gateway', slug: 'api-gateway', label: 'API Gateway', x: 450, y: 200 },
  { id: 'app', slug: 'application-server', label: 'App Server', x: 600, y: 200 },
  { id: 'cache', slug: 'redis', label: 'Redis', x: 750, y: 100 },
  { id: 'queue', slug: 'queue', label: 'Queue', x: 750, y: 300 },
  { id: 'db', slug: 'database', label: 'Database', x: 900, y: 200 },
  { id: 'replica', slug: 'read-replica', label: 'Read Replica', x: 900, y: 350 },
];

export const STANDARD_EDGES: Array<[string, string, string?]> = [
  ['user', 'dns'],
  ['dns', 'cdn', 'static'],
  ['dns', 'lb'],
  ['cdn', 'lb'],
  ['lb', 'gateway'],
  ['gateway', 'app'],
  ['app', 'cache'],
  ['app', 'queue'],
  ['cache', 'db'],
  ['app', 'db'],
  ['db', 'replica', 'replication'],
];

export function createScalingStages(baseNodes: FlowNode[], baseEdges: FlowEdge[]) {
  return [
    {
      stage: 1,
      title: 'Single Server',
      userCount: '100 Users',
      description: 'Monolithic application serving all traffic from a single server.',
      newTraffic: '~10 RPS',
      bottlenecks: ['Single point of failure', 'Limited CPU and memory'],
      scalingSolution: 'Add a load balancer and multiple application servers',
      whyPreviousFailed: 'Single server cannot handle concurrent connections and fails under load',
      nodes: baseNodes.filter((n) => ['user', 'app', 'db'].includes(n.id)).map((n, i) => ({
        ...n,
        position: { x: i * 200, y: 200 },
      })),
      edges: [
        { id: 's1e1', source: 'user', target: 'app', type: 'dataFlow' as const },
        { id: 's1e2', source: 'app', target: 'db', type: 'dataFlow' as const },
      ],
    },
    {
      stage: 2,
      title: 'Load Balancer',
      userCount: '10,000 Users',
      description: 'Horizontal scaling with load balancer distributing traffic.',
      newTraffic: '~1,000 RPS',
      bottlenecks: ['Database becomes bottleneck', 'No caching layer'],
      scalingSolution: 'Add Redis cache for hot data',
      whyPreviousFailed: 'All reads hit the database directly causing high latency',
      nodes: baseNodes.filter((n) => !['cdn', 'queue', 'replica', 'cache'].includes(n.id)),
      edges: baseEdges.filter((e) => !['cache', 'replica', 'queue', 'cdn'].some((s) => e.source.includes(s) || e.target.includes(s))),
    },
    {
      stage: 3,
      title: 'Redis Cache',
      userCount: '100,000 Users',
      description: 'Cache layer reduces database read load significantly.',
      newTraffic: '~10,000 RPS',
      bottlenecks: ['Database write bottleneck', 'Cache invalidation complexity'],
      scalingSolution: 'Add read replicas for read-heavy workloads',
      whyPreviousFailed: 'Write-heavy traffic and read misses still saturate the primary database',
      nodes: baseNodes.filter((n) => !['cdn', 'queue', 'replica'].includes(n.id)),
      edges: baseEdges.filter((e) => e.target !== 'replica' && e.source !== 'queue'),
    },
    {
      stage: 4,
      title: 'Read Replicas',
      userCount: '1 Million Users',
      description: 'Read replicas offload read traffic from primary database.',
      newTraffic: '~50,000 RPS',
      bottlenecks: ['Replication lag', 'Primary DB write limit'],
      scalingSolution: 'Shard database by user ID',
      whyPreviousFailed: 'Single primary database cannot handle write volume at scale',
      nodes: baseNodes.filter((n) => n.id !== 'queue'),
      edges: baseEdges.filter((e) => e.source !== 'queue' && e.target !== 'queue'),
    },
    {
      stage: 5,
      title: 'Sharding',
      userCount: '10 Million Users',
      description: 'Database sharded across multiple partitions.',
      newTraffic: '~200,000 RPS',
      bottlenecks: ['Cross-shard queries', 'Hot partitions'],
      scalingSolution: 'Decompose into microservices',
      whyPreviousFailed: 'Monolith deployment and shared database limit independent scaling',
      nodes: baseNodes,
      edges: baseEdges,
    },
    {
      stage: 6,
      title: 'Microservices',
      userCount: '100 Million Users',
      description: 'Domain-driven microservices with async messaging.',
      newTraffic: '~1,000,000 RPS',
      bottlenecks: ['Service coordination', 'Distributed tracing complexity'],
      scalingSolution: 'Service mesh, auto-scaling, multi-region deployment',
      whyPreviousFailed: 'Monolithic deployment cycles too slow for team velocity at scale',
      nodes: [
        ...baseNodes,
        { id: 'kafka', type: 'componentNode' as const, position: { x: 750, y: 400 }, data: { componentId: 'kafka', label: 'Kafka' } },
        { id: 'search', type: 'componentNode' as const, position: { x: 1050, y: 100 }, data: { componentId: 'search-service', label: 'Search' } },
        { id: 'storage', type: 'componentNode' as const, position: { x: 1050, y: 300 }, data: { componentId: 'object-storage', label: 'Object Storage' } },
        { id: 'notify', type: 'componentNode' as const, position: { x: 1050, y: 500 }, data: { componentId: 'notification-service', label: 'Notifications' } },
      ],
      edges: [
        ...baseEdges,
        { id: 'ms1', source: 'app', target: 'kafka', type: 'asyncFlow' as const },
        { id: 'ms2', source: 'kafka', target: 'notify', type: 'asyncFlow' as const },
        { id: 'ms3', source: 'app', target: 'search', type: 'dataFlow' as const },
        { id: 'ms4', source: 'app', target: 'storage', type: 'dataFlow' as const },
      ],
    },
  ];
}
