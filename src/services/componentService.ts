import * as componentRepo from '../repositories/componentRepository.js';
import { truncate, toIdString } from '../utils/apiResponse.js';

export async function listComponents(filters: { category?: string; search?: string }) {
  const components = await componentRepo.findAllComponents(filters);

  return {
    data: components.map((c) => ({
      id: toIdString(c._id),
      slug: c.slug,
      name: c.name,
      category: c.category,
      icon: c.icon,
      purpose: truncate(c.purpose, 200),
      interviewQuestionCount: c.interviewQuestions.length,
    })),
    meta: { total: components.length },
  };
}

export async function getComponent(idOrSlug: string) {
  const component = await componentRepo.findComponentByIdOrSlug(idOrSlug);
  if (!component) return null;

  return {
    id: toIdString(component._id),
    slug: component.slug,
    name: component.name,
    category: component.category,
    icon: component.icon,
    purpose: component.purpose,
    responsibilities: component.responsibilities,
    advantages: component.advantages,
    disadvantages: component.disadvantages,
    alternatives: component.alternatives,
    tradeoffs: component.tradeoffs,
    scalingConsiderations: component.scalingConsiderations,
    interviewQuestions: component.interviewQuestions,
    realWorldExamples: component.realWorldExamples,
    simulation: {
      baseCapacityRps: component.simulation.baseCapacityRps,
      cacheHitRateDefault: component.simulation.cacheHitRateDefault,
    },
    failure: {
      userFacingImpact: component.failure.userFacingImpact,
      internalImpact: component.failure.internalImpact,
      recoveryMechanisms: component.failure.recoveryMechanisms,
      industryMitigations: component.failure.industryMitigations,
      dependentComponents: component.failure.dependentComponents,
      cascadeSeverity: component.failure.cascadeSeverity,
    },
    cost: {
      unitType: component.cost.unitType,
      unitPriceMonthly: component.cost.unitPriceMonthly,
      minUnits: component.cost.minUnits,
    },
  };
}

export async function getComponentMap(slugs: string[]) {
  const components = await componentRepo.findComponentsBySlugs(slugs);
  return new Map(components.map((c) => [c.slug, c]));
}

export async function getAllComponentsMap() {
  const components = await componentRepo.findAllComponents({});
  return new Map(components.map((c) => [c.slug, c]));
}
