import { SubmissionModel, type ISubmission } from '../models/Submission.model.js';
import type { FlowEdge, FlowNode, ValidationItem } from '../types/index.js';
import type { Types } from 'mongoose';

export interface CreateSubmissionInput {
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

export async function createSubmission(data: CreateSubmissionInput): Promise<ISubmission> {
  return SubmissionModel.create(data);
}
