import { calculateCost } from '../engines/cost/costCalculator.js';
import type { CostCalculateRequest } from '../validators/schemas.js';

export function calculateInfrastructureCost(request: CostCalculateRequest) {
  return calculateCost(request.rps, request.configuration);
}
