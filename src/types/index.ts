export type ComponentCategory =
  | 'client'
  | 'network'
  | 'compute'
  | 'cache'
  | 'database'
  | 'messaging'
  | 'storage'
  | 'search'
  | 'notification'
  | 'gateway';

export type NodeStatus = 'healthy' | 'degraded' | 'down' | 'saturated';
export type NodeType = 'componentNode' | 'userNode' | 'groupNode';
export type EdgeType = 'dataFlow' | 'asyncFlow' | 'replication';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ChallengeDifficulty = 'junior' | 'mid' | 'senior' | 'staff';

export interface FlowPosition {
  x: number;
  y: number;
}

export interface FlowNodeData {
  componentId: string;
  label: string;
  status?: 'healthy' | 'degraded' | 'down';
}

export interface FlowNode {
  id: string;
  type: NodeType;
  position: FlowPosition;
  data: FlowNodeData;
  parentId?: string;
  extent?: 'parent';
}

export interface FlowEdgeData {
  protocol?: string;
  description?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  animated?: boolean;
  data?: FlowEdgeData;
}

export interface Alternative {
  name: string;
  description: string;
  whenToUse: string;
}

export interface InterviewQuestion {
  question: string;
  hint?: string;
  category: 'conceptual' | 'tradeoff' | 'failure' | 'scaling';
}

export interface ComponentSimulationMeta {
  baseCapacityRps: number;
  cpuPerRps: number;
  memoryMbBase: number;
  memoryPerRps: number;
  latencyMsBase: number;
  latencyPerRpsFactor: number;
  cacheHitRateDefault?: number;
  queueCapacity?: number;
  fanOut?: number;
}

export interface ComponentFailureMeta {
  userFacingImpact: string;
  internalImpact: string;
  recoveryMechanisms: string[];
  industryMitigations: string[];
  dependentComponents: string[];
  cascadeSeverity: 'none' | 'partial' | 'full';
}

export interface ComponentCostMeta {
  unitType: string;
  unitPriceMonthly: number;
  minUnits: number;
  scalingFactor: number;
}

export interface TrafficProfile {
  defaultRps: number;
  peakRps: number;
  readWriteRatio: number;
  avgPayloadKb: number;
}

export interface ScalingStage {
  stage: number;
  title: string;
  userCount: string;
  description: string;
  newTraffic: string;
  bottlenecks: string[];
  scalingSolution: string;
  whyPreviousFailed: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface ChallengeRequirement {
  id: string;
  text: string;
  priority: 'must' | 'should' | 'nice';
}

export interface ChallengeTraffic {
  dailyActiveUsers: string;
  requestsPerSecond: string;
  readWriteRatio: string;
  peakMultiplier: number;
}

export interface ChallengeScale {
  storageEstimate: string;
  growthRate: string;
  geographicScope: string;
}

export interface RequiredComponent {
  componentSlug: string;
  weight: number;
  reason: string;
}

export interface OptionalComponent {
  componentSlug: string;
  weight: number;
  reason: string;
}

export interface AntiPatternRule {
  type: 'missing_with_scale' | 'single_point_of_failure' | 'no_redundancy';
  condition: Record<string, unknown>;
}

export interface AntiPattern {
  id: string;
  description: string;
  penalty: number;
  detect: AntiPatternRule;
}

export interface GlobalMetrics {
  cpu: number;
  memory: number;
  throughput: number;
  latency: number;
  cacheHitRate: number;
  queueDepth: number;
  errorRate: number;
}

export interface NodeMetric {
  nodeId: string;
  componentSlug: string;
  label: string;
  utilization: number;
  latencyMs: number;
  status: NodeStatus;
  requestsPerSecond: number;
}

export interface Bottleneck {
  type: 'database' | 'cache_miss_storm' | 'hot_partition' | 'read_replica' | 'queue' | 'compute';
  label: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedNodeIds: string[];
  description: string;
  recommendation: string;
}

export interface SimulationResult {
  rps: number;
  metrics: GlobalMetrics;
  nodeMetrics: NodeMetric[];
  bottlenecks: Bottleneck[];
  timestamp: string;
}

export interface ValidationItem {
  componentSlug?: string;
  label: string;
  points: number;
  reason: string;
}

export interface ValidationResult {
  score: number;
  maxScore: number;
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  correct: ValidationItem[];
  missing: ValidationItem[];
  optional: ValidationItem[];
  antiPatternsFound: ValidationItem[];
  feedback: string[];
  submissionId?: string;
}

export interface InfraConfiguration {
  applicationServers: { count: number; instanceType?: string };
  redisClusters: { count: number; memoryGb?: number };
  databases: { count: number; instanceType?: string; readReplicas?: number };
  cdn: { enabled: boolean; bandwidthTb?: number };
  loadBalancers: { count: number };
  kafkaClusters?: { count: number; brokers?: number };
  objectStorage?: { storageTb: number };
  searchServices?: { count: number };
}

export interface CostLineItem {
  category: string;
  component: string;
  units: number;
  unitType: string;
  unitPrice: number;
  monthlyCost: number;
  percentage: number;
}

export interface CostEstimate {
  monthly: { total: number; currency: 'USD' };
  yearly: { total: number; currency: 'USD' };
  breakdown: CostLineItem[];
  charts: {
    byCategory: { category: string; amount: number }[];
    monthlyProjection: { month: string; amount: number }[];
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
