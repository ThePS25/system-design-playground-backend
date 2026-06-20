import { Schema, model, type Document, type Types } from 'mongoose';
import type { FlowEdge, FlowNode } from '../types/index.js';

export interface ISavedDesign extends Document {
  userId?: Types.ObjectId;
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport?: { x: number; y: number; zoom: number };
  basedOnTemplateId?: Types.ObjectId;
  basedOnChallengeId?: Types.ObjectId;
  module: 'explorer' | 'challenge' | 'custom';
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

const savedDesignSchema = new Schema<ISavedDesign>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    description: { type: String },
    nodes: [flowNodeSchema],
    edges: [flowEdgeSchema],
    viewport: {
      x: { type: Number },
      y: { type: Number },
      zoom: { type: Number },
    },
    basedOnTemplateId: { type: Schema.Types.ObjectId, ref: 'ArchitectureTemplate' },
    basedOnChallengeId: { type: Schema.Types.ObjectId, ref: 'Challenge' },
    module: {
      type: String,
      enum: ['explorer', 'challenge', 'custom'],
      required: true,
    },
  },
  { timestamps: true },
);

savedDesignSchema.index({ userId: 1, updatedAt: -1 });
savedDesignSchema.index({ name: 'text' });

export const SavedDesignModel = model<ISavedDesign>('SavedDesign', savedDesignSchema);
