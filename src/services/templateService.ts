import * as templateRepo from '../repositories/templateRepository.js';
import { toIdString } from '../utils/apiResponse.js';

export async function listTemplates(filters: {
  page: number;
  limit: number;
  difficulty?: string;
  tag?: string;
}) {
  const { templates, total } = await templateRepo.findTemplates(filters);

  return {
    data: templates.map((t) => ({
      id: toIdString(t._id),
      slug: t.slug,
      name: t.name,
      description: t.description,
      tagline: t.tagline,
      difficulty: t.difficulty,
      tags: t.tags,
      thumbnailUrl: t.thumbnailUrl,
      stageCount: t.scalingStages.length,
    })),
    meta: { page: filters.page, limit: filters.limit, total },
  };
}

export async function getTemplate(idOrSlug: string) {
  const template = await templateRepo.findTemplateByIdOrSlug(idOrSlug);
  if (!template) return null;

  return {
    id: toIdString(template._id),
    slug: template.slug,
    name: template.name,
    description: template.description,
    tagline: template.tagline,
    difficulty: template.difficulty,
    tags: template.tags,
    trafficProfile: template.trafficProfile,
    nodes: template.nodes,
    edges: template.edges,
    scalingStages: template.scalingStages,
    createdAt: template.createdAt?.toISOString(),
    updatedAt: template.updatedAt?.toISOString(),
  };
}
