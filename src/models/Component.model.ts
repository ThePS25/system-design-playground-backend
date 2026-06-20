import { Schema, model, type Document } from 'mongoose';
import type {
  Alternative,
  ComponentCategory,
  ComponentCostMeta,
  ComponentFailureMeta,
  ComponentSimulationMeta,
  InterviewQuestion,
} from '../types/index.js';

export interface IComponent extends Document {
  slug: string;
  name: string;
  category: ComponentCategory;
  icon: string;
  purpose: string;
  responsibilities: string[];
  advantages: string[];
  disadvantages: string[];
  alternatives: Alternative[];
  tradeoffs: string[];
  scalingConsiderations: string[];
  interviewQuestions: InterviewQuestion[];
  realWorldExamples: string[];
  simulation: ComponentSimulationMeta;
  failure: ComponentFailureMeta;
  cost: ComponentCostMeta;
}

const alternativeSchema = new Schema<Alternative>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    whenToUse: { type: String, required: true },
  },
  { _id: false },
);

const interviewQuestionSchema = new Schema<InterviewQuestion>(
  {
    question: { type: String, required: true },
    hint: { type: String },
    category: {
      type: String,
      enum: ['conceptual', 'tradeoff', 'failure', 'scaling'],
      required: true,
    },
  },
  { _id: false },
);

const componentSchema = new Schema<IComponent>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['client', 'network', 'compute', 'cache', 'database', 'messaging', 'storage', 'search', 'notification', 'gateway'],
      required: true,
    },
    icon: { type: String, required: true },
    purpose: { type: String, required: true },
    responsibilities: [{ type: String }],
    advantages: [{ type: String }],
    disadvantages: [{ type: String }],
    alternatives: [alternativeSchema],
    tradeoffs: [{ type: String }],
    scalingConsiderations: [{ type: String }],
    interviewQuestions: [interviewQuestionSchema],
    realWorldExamples: [{ type: String }],
    simulation: {
      baseCapacityRps: { type: Number, required: true },
      cpuPerRps: { type: Number, required: true },
      memoryMbBase: { type: Number, required: true },
      memoryPerRps: { type: Number, required: true },
      latencyMsBase: { type: Number, required: true },
      latencyPerRpsFactor: { type: Number, required: true },
      cacheHitRateDefault: { type: Number },
      queueCapacity: { type: Number },
      fanOut: { type: Number },
    },
    failure: {
      userFacingImpact: { type: String, required: true },
      internalImpact: { type: String, required: true },
      recoveryMechanisms: [{ type: String }],
      industryMitigations: [{ type: String }],
      dependentComponents: [{ type: String }],
      cascadeSeverity: {
        type: String,
        enum: ['none', 'partial', 'full'],
        required: true,
      },
    },
    cost: {
      unitType: { type: String, required: true },
      unitPriceMonthly: { type: Number, required: true },
      minUnits: { type: Number, required: true },
      scalingFactor: { type: Number, required: true },
    },
  },
  { timestamps: true },
);

componentSchema.index({ category: 1 });
componentSchema.index({ name: 'text', purpose: 'text' });

export const ComponentModel = model<IComponent>('Component', componentSchema);
