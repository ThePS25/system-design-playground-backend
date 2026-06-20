import { Types } from 'mongoose';
import * as savedDesignRepo from '../repositories/savedDesignRepository.js';
import type { SaveDesignRequest } from '../validators/schemas.js';
import { toIdString } from '../utils/apiResponse.js';

export async function saveDesign(request: SaveDesignRequest) {
  const design = await savedDesignRepo.createSavedDesign({
    name: request.name,
    description: request.description,
    nodes: request.nodes,
    edges: request.edges,
    viewport: request.viewport,
    basedOnTemplateId: request.basedOnTemplateId
      ? new Types.ObjectId(request.basedOnTemplateId)
      : undefined,
    basedOnChallengeId: request.basedOnChallengeId
      ? new Types.ObjectId(request.basedOnChallengeId)
      : undefined,
    module: request.module,
    userId: request.userId ? new Types.ObjectId(request.userId) : undefined,
  });

  return {
    id: toIdString(design._id),
    name: design.name,
    createdAt: design.createdAt?.toISOString(),
  };
}

export async function listSavedDesigns(filters: {
  page: number;
  limit: number;
  userId?: string;
  module?: string;
}) {
  const { designs, total } = await savedDesignRepo.findSavedDesigns(filters);

  return {
    data: designs.map((d) => ({
      id: toIdString(d._id),
      name: d.name,
      description: d.description,
      module: d.module,
      nodeCount: d.nodes.length,
      edgeCount: d.edges.length,
      basedOnTemplateId: d.basedOnTemplateId ? toIdString(d.basedOnTemplateId) : undefined,
      basedOnChallengeId: d.basedOnChallengeId ? toIdString(d.basedOnChallengeId) : undefined,
      createdAt: d.createdAt?.toISOString(),
      updatedAt: d.updatedAt?.toISOString(),
    })),
    meta: { page: filters.page, limit: filters.limit, total },
  };
}
