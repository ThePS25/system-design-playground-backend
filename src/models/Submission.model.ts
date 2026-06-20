import { Schema, model, type Document, type Types } from 'mongoose';
import type { FlowEdge, FlowNode, ValidationItem } from '../types/index.js';

export interface ISubmission extends Document {
  challengeId: Types.ObjectId;
  userId?: Types.ObjectId;
  nodes: FlowNode[];
  edges: FlowEdge[];
  score: number;
  maxScore: number;
  correct: ValidationItem[];
  missing: ValidationItem[];
  antiPatternsFound: ValidationItem[];
  feedback: string[];
  submittedAt: Date;
}

const validationItemSchema = new Schema<ValidationItem>(
  {
    componentSlug: { type: String },
    label: { type: String, required: true },
    points: { type: Number, required: true },
    reason: { type: String, required: true },
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
  },
  { _id: false },
);

const submissionSchema = new Schema<ISubmission>(
  {
    challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    nodes: [flowNodeSchema],
    edges: [flowEdgeSchema],
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    correct: [validationItemSchema],
    missing: [validationItemSchema],
    antiPatternsFound: [validationItemSchema],
    feedback: [{ type: String }],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

submissionSchema.index({ challengeId: 1, submittedAt: -1 });
submissionSchema.index({ userId: 1, submittedAt: -1 });

export const SubmissionModel = model<ISubmission>('Submission', submissionSchema);
