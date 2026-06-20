import { Schema, model, type Document } from 'mongoose';
import type {
  Difficulty,
  FlowEdge,
  FlowNode,
  ScalingStage,
  TrafficProfile,
} from '../types/index.js';

export interface IArchitectureTemplate extends Document {
  slug: string;
  name: string;
  description: string;
  tagline: string;
  difficulty: Difficulty;
  tags: string[];
  trafficProfile: TrafficProfile;
  nodes: FlowNode[];
  edges: FlowEdge[];
  scalingStages: ScalingStage[];
  thumbnailUrl?: string;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

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
    parentId: { type: String },
    extent: { type: String, enum: ['parent'] },
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
    data: {
      protocol: { type: String },
      description: { type: String },
    },
  },
  { _id: false },
);

const scalingStageSchema = new Schema<ScalingStage>(
  {
    stage: { type: Number, required: true },
    title: { type: String, required: true },
    userCount: { type: String, required: true },
    description: { type: String, required: true },
    newTraffic: { type: String, required: true },
    bottlenecks: [{ type: String }],
    scalingSolution: { type: String, required: true },
    whyPreviousFailed: { type: String, required: true },
    nodes: [flowNodeSchema],
    edges: [flowEdgeSchema],
  },
  { _id: false },
);

const templateSchema = new Schema<IArchitectureTemplate>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    tagline: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    tags: [{ type: String }],
    trafficProfile: {
      defaultRps: { type: Number, required: true },
      peakRps: { type: Number, required: true },
      readWriteRatio: { type: Number, required: true },
      avgPayloadKb: { type: Number, required: true },
    },
    nodes: [flowNodeSchema],
    edges: [flowEdgeSchema],
    scalingStages: [scalingStageSchema],
    thumbnailUrl: { type: String },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

templateSchema.index({ tags: 1 });
templateSchema.index({ difficulty: 1 });
templateSchema.index({ isPublished: 1 });

export const ArchitectureTemplateModel = model<IArchitectureTemplate>(
  'ArchitectureTemplate',
  templateSchema,
);
