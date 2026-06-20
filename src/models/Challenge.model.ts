import { Schema, model, type Document } from 'mongoose';
import type {
  AntiPattern,
  ChallengeDifficulty,
  ChallengeRequirement,
  ChallengeScale,
  ChallengeTraffic,
  FlowEdge,
  FlowNode,
  OptionalComponent,
  RequiredComponent,
} from '../types/index.js';

export interface IChallenge extends Document {
  slug: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  requirements: ChallengeRequirement[];
  traffic: ChallengeTraffic;
  scale: ChallengeScale;
  constraints: string[];
  requiredComponents: RequiredComponent[];
  optionalComponents: OptionalComponent[];
  antiPatterns: AntiPattern[];
  starterNodes: FlowNode[];
  starterEdges: FlowEdge[];
  timeLimitMinutes?: number;
  maxScore: number;
  isPublished: boolean;
}

const requirementSchema = new Schema<ChallengeRequirement>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    priority: { type: String, enum: ['must', 'should', 'nice'], required: true },
  },
  { _id: false },
);

const requiredComponentSchema = new Schema<RequiredComponent>(
  {
    componentSlug: { type: String, required: true },
    weight: { type: Number, required: true },
    reason: { type: String, required: true },
  },
  { _id: false },
);

const optionalComponentSchema = new Schema<OptionalComponent>(
  {
    componentSlug: { type: String, required: true },
    weight: { type: Number, required: true },
    reason: { type: String, required: true },
  },
  { _id: false },
);

const antiPatternSchema = new Schema<AntiPattern>(
  {
    id: { type: String, required: true },
    description: { type: String, required: true },
    penalty: { type: Number, required: true },
    detect: {
      type: { type: String, enum: ['missing_with_scale', 'single_point_of_failure', 'no_redundancy'] },
      condition: { type: Schema.Types.Mixed },
    },
  },
  { _id: false },
);

const positionSchema = new Schema(
  { x: { type: Number, required: true }, y: { type: Number, required: true } },
  { _id: false },
);

const flowNodeSchema = new Schema<FlowNode>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['componentNode', 'userNode', 'groupNode'], required: true },
    position: { type: positionSchema, required: true },
    data: {
      componentId: { type: String, required: true },
      label: { type: String, required: true },
      status: { type: String, enum: ['healthy', 'degraded', 'down'] },
    },
  },
  { _id: false },
);

const flowEdgeSchema = new Schema<FlowEdge>(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    type: { type: String, enum: ['dataFlow', 'asyncFlow', 'replication'], required: true },
    label: { type: String },
    animated: { type: Boolean },
  },
  { _id: false },
);

const challengeSchema = new Schema<IChallenge>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['junior', 'mid', 'senior', 'staff'],
      required: true,
    },
    requirements: [requirementSchema],
    traffic: {
      dailyActiveUsers: { type: String, required: true },
      requestsPerSecond: { type: String, required: true },
      readWriteRatio: { type: String, required: true },
      peakMultiplier: { type: Number, required: true },
    },
    scale: {
      storageEstimate: { type: String, required: true },
      growthRate: { type: String, required: true },
      geographicScope: { type: String, required: true },
    },
    constraints: [{ type: String }],
    requiredComponents: [requiredComponentSchema],
    optionalComponents: [optionalComponentSchema],
    antiPatterns: [antiPatternSchema],
    starterNodes: [flowNodeSchema],
    starterEdges: [flowEdgeSchema],
    timeLimitMinutes: { type: Number },
    maxScore: { type: Number, default: 100 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

challengeSchema.index({ difficulty: 1 });
challengeSchema.index({ isPublished: 1 });

export const ChallengeModel = model<IChallenge>('Challenge', challengeSchema);
