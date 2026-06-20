export const RPS_LEVELS = [100, 1000, 10000, 100000, 1000000] as const;

export const BOTTLENECK_THRESHOLDS = {
  databaseUtilization: 85,
  readReplicaUtilization: 90,
  cacheHitRateMin: 0.6,
  hotPartitionRatio: 0.4,
  queueSaturation: 0.8,
} as const;

export const GRADE_THRESHOLDS = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
} as const;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
