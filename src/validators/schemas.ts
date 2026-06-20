import { z } from 'zod';

export const FlowNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['componentNode', 'userNode', 'groupNode']),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({
    componentId: z.string().min(1),
    label: z.string().min(1),
    status: z.enum(['healthy', 'degraded', 'down']).optional(),
  }),
  parentId: z.string().optional(),
  extent: z.enum(['parent']).optional(),
});

export const FlowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  type: z.enum(['dataFlow', 'asyncFlow', 'replication']),
  label: z.string().optional(),
  animated: z.boolean().optional(),
  data: z
    .object({
      protocol: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

export const SimulationRequestSchema = z.object({
  templateId: z.string().optional(),
  rps: z.union([
    z.literal(100),
    z.literal(1000),
    z.literal(10000),
    z.literal(100000),
    z.literal(1000000),
  ]),
  nodes: z.array(FlowNodeSchema).min(1),
  edges: z.array(FlowEdgeSchema),
  disabledComponents: z.array(z.string()).optional(),
});

export const ValidateChallengeRequestSchema = z.object({
  challengeId: z.string().min(1),
  nodes: z.array(FlowNodeSchema).min(1),
  edges: z.array(FlowEdgeSchema),
  saveSubmission: z.boolean().optional(),
  userId: z.string().optional(),
});

export const InfraConfigurationSchema = z.object({
  applicationServers: z.object({
    count: z.number().int().min(0),
    instanceType: z.string().optional(),
  }),
  redisClusters: z.object({
    count: z.number().int().min(0),
    memoryGb: z.number().optional(),
  }),
  databases: z.object({
    count: z.number().int().min(0),
    instanceType: z.string().optional(),
    readReplicas: z.number().int().min(0).optional(),
  }),
  cdn: z.object({
    enabled: z.boolean(),
    bandwidthTb: z.number().optional(),
  }),
  loadBalancers: z.object({
    count: z.number().int().min(0),
  }),
  kafkaClusters: z
    .object({
      count: z.number().int().min(0),
      brokers: z.number().int().min(0).optional(),
    })
    .optional(),
  objectStorage: z
    .object({
      storageTb: z.number().min(0),
    })
    .optional(),
  searchServices: z
    .object({
      count: z.number().int().min(0),
    })
    .optional(),
});

export const CostCalculateRequestSchema = z.object({
  rps: z.number().min(0),
  configuration: InfraConfigurationSchema,
  region: z.string().optional(),
});

export const SaveDesignRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  nodes: z.array(FlowNodeSchema).min(1),
  edges: z.array(FlowEdgeSchema),
  viewport: z
    .object({
      x: z.number(),
      y: z.number(),
      zoom: z.number(),
    })
    .optional(),
  basedOnTemplateId: z.string().optional(),
  basedOnChallengeId: z.string().optional(),
  module: z.enum(['explorer', 'challenge', 'custom']),
  userId: z.string().optional(),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const TemplateListQuerySchema = PaginationQuerySchema.extend({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tag: z.string().optional(),
});

export const ComponentListQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
});

export const ChallengeListQuerySchema = z.object({
  difficulty: z.enum(['junior', 'mid', 'senior', 'staff']).optional(),
});

export const SavedDesignListQuerySchema = PaginationQuerySchema.extend({
  userId: z.string().optional(),
  module: z.enum(['explorer', 'challenge', 'custom']).optional(),
});

export type SimulationRequest = z.infer<typeof SimulationRequestSchema>;
export type ValidateChallengeRequest = z.infer<typeof ValidateChallengeRequestSchema>;
export type CostCalculateRequest = z.infer<typeof CostCalculateRequestSchema>;
export type SaveDesignRequest = z.infer<typeof SaveDesignRequestSchema>;
