import { ComponentModel, type IComponent } from '../models/Component.model.js';
import { isObjectId } from '../utils/apiResponse.js';

export async function findAllComponents(filters: {
  category?: string;
  search?: string;
}): Promise<IComponent[]> {
  const query: Record<string, unknown> = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  return ComponentModel.find(query).sort({ name: 1 }).exec();
}

export async function findComponentByIdOrSlug(idOrSlug: string): Promise<IComponent | null> {
  if (isObjectId(idOrSlug)) {
    return ComponentModel.findById(idOrSlug).exec();
  }
  return ComponentModel.findOne({ slug: idOrSlug }).exec();
}

export async function findComponentsBySlugs(slugs: string[]): Promise<IComponent[]> {
  return ComponentModel.find({ slug: { $in: slugs } }).exec();
}

export async function upsertComponents(components: Partial<IComponent>[]): Promise<void> {
  for (const component of components) {
    await ComponentModel.findOneAndUpdate(
      { slug: component.slug },
      component,
      { upsert: true, new: true },
    );
  }
}
