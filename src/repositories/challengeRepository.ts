import { ChallengeModel, type IChallenge } from '../models/Challenge.model.js';
import { isObjectId } from '../utils/apiResponse.js';

export async function findChallenges(filters: {
  difficulty?: string;
}): Promise<IChallenge[]> {
  const query: Record<string, unknown> = { isPublished: true };

  if (filters.difficulty) {
    query.difficulty = filters.difficulty;
  }

  return ChallengeModel.find(query).sort({ title: 1 }).exec();
}

export async function findChallengeByIdOrSlug(
  idOrSlug: string,
): Promise<IChallenge | null> {
  if (isObjectId(idOrSlug)) {
    return ChallengeModel.findById(idOrSlug).exec();
  }
  return ChallengeModel.findOne({ slug: idOrSlug, isPublished: true }).exec();
}

export async function upsertChallenge(challenge: Partial<IChallenge>): Promise<void> {
  await ChallengeModel.findOneAndUpdate(
    { slug: challenge.slug },
    challenge,
    { upsert: true, new: true },
  );
}
