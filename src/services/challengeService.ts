import * as challengeRepo from '../repositories/challengeRepository.js';
import * as submissionRepo from '../repositories/submissionRepository.js';
import { validateChallenge } from '../engines/challenge/challengeValidator.js';
import type { ValidateChallengeRequest } from '../validators/schemas.js';
import { Types } from 'mongoose';
import { toIdString } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';

export async function listChallenges(filters: { difficulty?: string }) {
  const challenges = await challengeRepo.findChallenges(filters);

  return {
    data: challenges.map((c) => ({
      id: toIdString(c._id),
      slug: c.slug,
      title: c.title,
      description: c.description,
      difficulty: c.difficulty,
      requirementCount: c.requirements.length,
      maxScore: c.maxScore,
      timeLimitMinutes: c.timeLimitMinutes,
    })),
    meta: { total: challenges.length },
  };
}

export async function getChallenge(idOrSlug: string) {
  const challenge = await challengeRepo.findChallengeByIdOrSlug(idOrSlug);
  if (!challenge) return null;

  return {
    id: toIdString(challenge._id),
    slug: challenge.slug,
    title: challenge.title,
    description: challenge.description,
    difficulty: challenge.difficulty,
    requirements: challenge.requirements,
    traffic: challenge.traffic,
    scale: challenge.scale,
    constraints: challenge.constraints,
    starterNodes: challenge.starterNodes,
    starterEdges: challenge.starterEdges,
    maxScore: challenge.maxScore,
    timeLimitMinutes: challenge.timeLimitMinutes,
  };
}

export async function validateChallengeSubmission(request: ValidateChallengeRequest) {
  const challenge = await challengeRepo.findChallengeByIdOrSlug(request.challengeId);
  if (!challenge) {
    throw new AppError(404, 'NOT_FOUND', 'Challenge not found');
  }

  const result = validateChallenge(challenge, request.nodes, request.edges);

  if (request.saveSubmission) {
    const submission = await submissionRepo.createSubmission({
      challengeId: challenge._id,
      userId: request.userId ? new Types.ObjectId(request.userId) : undefined,
      nodes: request.nodes,
      edges: request.edges,
      score: result.score,
      maxScore: result.maxScore,
      correct: result.correct,
      missing: result.missing,
      antiPatternsFound: result.antiPatternsFound,
      feedback: result.feedback,
      submittedAt: new Date(),
    });
    result.submissionId = toIdString(submission._id);
  }

  return result;
}
