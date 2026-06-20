import type { CostEstimate, InfraConfiguration } from '../../types/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pricing = JSON.parse(
  readFileSync(join(__dirname, '../../seed/data/pricing.json'), 'utf-8'),
) as Record<string, { unitType: string; unitPriceMonthly: number; category: string; label: string }>;

const PRICING = pricing;

function lineItem(
  key: string,
  units: number,
  totalMonthly: number,
): { category: string; component: string; units: number; unitType: string; unitPrice: number; monthlyCost: number; percentage: number } {
  const entry = PRICING[key];
  const monthlyCost = Math.round(units * entry.unitPriceMonthly * 100) / 100;
  return {
    category: entry.category,
    component: entry.label,
    units,
    unitType: entry.unitType,
    unitPrice: entry.unitPriceMonthly,
    monthlyCost,
    percentage: totalMonthly > 0 ? Math.round((monthlyCost / totalMonthly) * 100) : 0,
  };
}

export function calculateCost(rps: number, config: InfraConfiguration): CostEstimate {
  const rpsFactor = Math.max(1, Math.ceil(rps / 10000));
  const breakdown: CostEstimate['breakdown'] = [];

  const appUnits = Math.max(config.applicationServers.count, rpsFactor);
  breakdown.push(lineItem('application-server', appUnits, 0));

  if (config.redisClusters.count > 0) {
    breakdown.push(lineItem('redis', config.redisClusters.count, 0));
  }

  const dbUnits = config.databases.count + (config.databases.readReplicas ?? 0);
  if (dbUnits > 0) {
    breakdown.push(lineItem('database', dbUnits, 0));
  }

  if (config.cdn.enabled) {
    const bandwidth = config.cdn.bandwidthTb ?? Math.max(1, rpsFactor * 0.5);
    breakdown.push(lineItem('cdn', Math.ceil(bandwidth), 0));
  }

  if (config.loadBalancers.count > 0) {
    breakdown.push(lineItem('load-balancer', config.loadBalancers.count, 0));
  }

  if (config.kafkaClusters && config.kafkaClusters.count > 0) {
    breakdown.push(lineItem('kafka', config.kafkaClusters.count, 0));
  }

  if (config.objectStorage) {
    breakdown.push(lineItem('object-storage', Math.ceil(config.objectStorage.storageTb), 0));
  }

  if (config.searchServices && config.searchServices.count > 0) {
    breakdown.push(lineItem('search-service', config.searchServices.count, 0));
  }

  const totalMonthly = breakdown.reduce((sum, item) => sum + item.monthlyCost, 0);

  const withPercentages = breakdown.map((item) => ({
    ...item,
    percentage: totalMonthly > 0 ? Math.round((item.monthlyCost / totalMonthly) * 100) : 0,
  }));

  const byCategoryMap = new Map<string, number>();
  for (const item of withPercentages) {
    byCategoryMap.set(item.category, (byCategoryMap.get(item.category) ?? 0) + item.monthlyCost);
  }

  const byCategory = Array.from(byCategoryMap.entries()).map(([category, amount]) => ({
    category,
    amount: Math.round(amount * 100) / 100,
  }));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyProjection = months.map((month, index) => ({
    month,
    amount: Math.round(totalMonthly * (1 + index * 0.02) * 100) / 100,
  }));

  return {
    monthly: { total: Math.round(totalMonthly * 100) / 100, currency: 'USD' },
    yearly: { total: Math.round(totalMonthly * 12 * 100) / 100, currency: 'USD' },
    breakdown: withPercentages,
    charts: { byCategory, monthlyProjection },
  };
}
