import type { IChallenge } from '../../models/Challenge.model.js';
import type { FlowEdge, FlowNode, ValidationItem, ValidationResult } from '../../types/index.js';
import { collectComponentSlugs } from '../../utils/graph.utils.js';
import { calculateGrade } from '../../utils/apiResponse.js';

function detectAntiPatterns(
  challenge: IChallenge,
  presentSlugs: Set<string>,
  nodes: FlowNode[],
): ValidationItem[] {
  const found: ValidationItem[] = [];

  for (const antiPattern of challenge.antiPatterns) {
    const { type, condition } = antiPattern.detect;

    if (type === 'single_point_of_failure') {
      const slug = condition.componentSlug as string;
      const count = nodes.filter((n) => n.data.componentId === slug).length;
      if (count === 1 && presentSlugs.has(slug)) {
        found.push({
          componentSlug: slug,
          label: antiPattern.description,
          points: -antiPattern.penalty,
          reason: `Single ${slug} creates a single point of failure`,
        });
      }
    }

    if (type === 'no_redundancy') {
      const slug = condition.componentSlug as string;
      const minCount = (condition.minCount as number) ?? 2;
      const count = nodes.filter((n) => n.data.componentId === slug).length;
      if (presentSlugs.has(slug) && count < minCount) {
        found.push({
          componentSlug: slug,
          label: antiPattern.description,
          points: -antiPattern.penalty,
          reason: `Need at least ${minCount} ${slug} instances for redundancy`,
        });
      }
    }

    if (type === 'missing_with_scale') {
      const slug = condition.componentSlug as string;
      if (!presentSlugs.has(slug)) {
        found.push({
          componentSlug: slug,
          label: antiPattern.description,
          points: -antiPattern.penalty,
          reason: antiPattern.description,
        });
      }
    }
  }

  return found;
}

function generateFeedback(
  correct: ValidationItem[],
  missing: ValidationItem[],
  antiPatterns: ValidationItem[],
): string[] {
  const feedback: string[] = [];

  if (correct.length > 0) {
    feedback.push(
      `Good foundation with ${correct.map((c) => c.label).slice(0, 3).join(', ')}.`,
    );
  }

  for (const item of missing.slice(0, 3)) {
    feedback.push(`Missing ${item.label} — ${item.reason}`);
  }

  for (const item of antiPatterns.slice(0, 2)) {
    feedback.push(`Anti-pattern: ${item.reason}`);
  }

  if (feedback.length === 0) {
    feedback.push('Add core infrastructure components to improve your architecture score.');
  }

  return feedback;
}

export function validateChallenge(
  challenge: IChallenge,
  nodes: FlowNode[],
  _edges: FlowEdge[],
): ValidationResult {
  const presentSlugs = collectComponentSlugs(nodes);
  const maxScore = challenge.maxScore;

  const correct: ValidationItem[] = [];
  const missing: ValidationItem[] = [];
  const optional: ValidationItem[] = [];

  let score = 0;

  for (const required of challenge.requiredComponents) {
    const item: ValidationItem = {
      componentSlug: required.componentSlug,
      label: formatLabel(required.componentSlug),
      points: required.weight,
      reason: required.reason,
    };

    if (presentSlugs.has(required.componentSlug)) {
      correct.push(item);
      score += required.weight;
    } else {
      missing.push({ ...item, points: 0 });
    }
  }

  for (const opt of challenge.optionalComponents) {
    const item: ValidationItem = {
      componentSlug: opt.componentSlug,
      label: formatLabel(opt.componentSlug),
      points: opt.weight,
      reason: opt.reason,
    };

    if (presentSlugs.has(opt.componentSlug)) {
      optional.push(item);
      score += opt.weight;
    }
  }

  const antiPatternsFound = detectAntiPatterns(challenge, presentSlugs, nodes);
  for (const anti of antiPatternsFound) {
    score += anti.points;
  }

  score = Math.max(0, Math.min(maxScore, score));
  const percentage = Math.round((score / maxScore) * 100);

  return {
    score,
    maxScore,
    percentage,
    grade: calculateGrade(percentage),
    correct,
    missing,
    optional,
    antiPatternsFound,
    feedback: generateFeedback(correct, missing, antiPatternsFound),
  };
}

function formatLabel(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
