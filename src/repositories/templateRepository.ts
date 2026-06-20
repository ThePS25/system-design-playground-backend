import {
  ArchitectureTemplateModel,
  type IArchitectureTemplate,
} from '../models/ArchitectureTemplate.model.js';
import { isObjectId } from '../utils/apiResponse.js';

export async function findTemplates(filters: {
  page: number;
  limit: number;
  difficulty?: string;
  tag?: string;
}): Promise<{ templates: IArchitectureTemplate[]; total: number }> {
  const query: Record<string, unknown> = { isPublished: true };

  if (filters.difficulty) {
    query.difficulty = filters.difficulty;
  }

  if (filters.tag) {
    query.tags = filters.tag;
  }

  const skip = (filters.page - 1) * filters.limit;

  const [templates, total] = await Promise.all([
    ArchitectureTemplateModel.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(filters.limit)
      .exec(),
    ArchitectureTemplateModel.countDocuments(query).exec(),
  ]);

  return { templates, total };
}

export async function findTemplateByIdOrSlug(
  idOrSlug: string,
): Promise<IArchitectureTemplate | null> {
  if (isObjectId(idOrSlug)) {
    return ArchitectureTemplateModel.findById(idOrSlug).exec();
  }
  return ArchitectureTemplateModel.findOne({ slug: idOrSlug, isPublished: true }).exec();
}

export async function upsertTemplate(template: Partial<IArchitectureTemplate>): Promise<void> {
  await ArchitectureTemplateModel.findOneAndUpdate(
    { slug: template.slug },
    template,
    { upsert: true, new: true },
  );
}
