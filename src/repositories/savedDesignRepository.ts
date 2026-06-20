import { SavedDesignModel, type ISavedDesign } from '../models/SavedDesign.model.js';

export async function createSavedDesign(
  data: Partial<ISavedDesign>,
): Promise<ISavedDesign> {
  return SavedDesignModel.create(data);
}

export async function findSavedDesigns(filters: {
  page: number;
  limit: number;
  userId?: string;
  module?: string;
}): Promise<{ designs: ISavedDesign[]; total: number }> {
  const query: Record<string, unknown> = {};

  if (filters.userId) {
    query.userId = filters.userId;
  }

  if (filters.module) {
    query.module = filters.module;
  }

  const skip = (filters.page - 1) * filters.limit;

  const [designs, total] = await Promise.all([
    SavedDesignModel.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(filters.limit)
      .exec(),
    SavedDesignModel.countDocuments(query).exec(),
  ]);

  return { designs, total };
}
