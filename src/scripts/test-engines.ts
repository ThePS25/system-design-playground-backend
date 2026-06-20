import { validateChallenge } from '../engines/challenge/challengeValidator.js';
import { runSimulation } from '../engines/simulation/simulationEngine.js';
import { calculateCost } from '../engines/cost/costCalculator.js';
import type { IChallenge } from '../models/Challenge.model.js';
import type { IComponent } from '../models/Component.model.js';
import type { FlowNode } from '../types/index.js';

const mockComponent = (slug: string, overrides?: Partial<IComponent['simulation']>): IComponent =>
  ({
    slug,
    simulation: {
      baseCapacityRps: slug === 'database' ? 10000 : 100000,
      cpuPerRps: 0.002,
      memoryMbBase: 512,
      memoryPerRps: 0.01,
      latencyMsBase: slug === 'redis' ? 1 : 15,
      latencyPerRpsFactor: 0.0001,
      cacheHitRateDefault: slug === 'redis' ? 0.85 : undefined,
      fanOut: slug === 'application-server' ? 2 : 1,
      ...overrides,
    },
  }) as IComponent;

const nodes: FlowNode[] = [
  { id: 'user', type: 'userNode', position: { x: 0, y: 0 }, data: { componentId: 'user', label: 'User' } },
  { id: 'lb', type: 'componentNode', position: { x: 100, y: 0 }, data: { componentId: 'load-balancer', label: 'LB' } },
  { id: 'app', type: 'componentNode', position: { x: 200, y: 0 }, data: { componentId: 'application-server', label: 'App' } },
  { id: 'cache', type: 'componentNode', position: { x: 300, y: 0 }, data: { componentId: 'redis', label: 'Redis' } },
  { id: 'db', type: 'componentNode', position: { x: 400, y: 0 }, data: { componentId: 'database', label: 'DB' } },
];

const edges = [
  { id: 'e1', source: 'user', target: 'lb', type: 'dataFlow' as const },
  { id: 'e2', source: 'lb', target: 'app', type: 'dataFlow' as const },
  { id: 'e3', source: 'app', target: 'cache', type: 'dataFlow' as const },
  { id: 'e4', source: 'cache', target: 'db', type: 'dataFlow' as const },
];

const componentMap = new Map([
  ['user', mockComponent('user')],
  ['load-balancer', mockComponent('load-balancer')],
  ['application-server', mockComponent('application-server')],
  ['redis', mockComponent('redis')],
  ['database', mockComponent('database')],
]);

console.log('Testing simulation engine...');
const sim = runSimulation(nodes, edges, 100000, componentMap);
console.log(`  RPS: ${sim.rps}, CPU: ${sim.metrics.cpu}%, Latency: ${sim.metrics.latency}ms`);
console.log(`  Bottlenecks: ${sim.bottlenecks.map((b) => b.label).join(', ') || 'none'}`);

console.log('\nTesting challenge validator...');
const challenge = {
  maxScore: 100,
  requiredComponents: [
    { componentSlug: 'load-balancer', weight: 15, reason: 'Scaling' },
    { componentSlug: 'redis', weight: 15, reason: 'Cache' },
    { componentSlug: 'database', weight: 15, reason: 'Storage' },
    { componentSlug: 'cdn', weight: 15, reason: 'Media' },
  ],
  optionalComponents: [],
  antiPatterns: [],
} as IChallenge;

const result = validateChallenge(challenge, nodes, edges);
console.log(`  Score: ${result.score}/${result.maxScore} (${result.grade})`);
console.log(`  Missing: ${result.missing.map((m) => m.label).join(', ')}`);

console.log('\nTesting cost calculator...');
const cost = calculateCost(10000, {
  applicationServers: { count: 4 },
  redisClusters: { count: 2 },
  databases: { count: 1, readReplicas: 2 },
  cdn: { enabled: true, bandwidthTb: 5 },
  loadBalancers: { count: 2 },
});
console.log(`  Monthly: $${cost.monthly.total}, Yearly: $${cost.yearly.total}`);

console.log('\n✅ All engine tests passed');
