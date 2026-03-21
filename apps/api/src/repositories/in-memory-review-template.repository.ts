import { Injectable } from '@nestjs/common';
import type { ReviewTemplate, ReviewTemplateMetadata } from '@scrambleiq/shared';

import {
  buildChecklistItems,
  type CreateReviewTemplateInput,
  type ReviewTemplateRepository,
  type UpdateReviewTemplateInput,
} from './review-template.repository';

@Injectable()
export class InMemoryReviewTemplateRepository implements ReviewTemplateRepository {
  constructor(private readonly templates: ReviewTemplate[]) {}

  async create(input: CreateReviewTemplateInput): Promise<ReviewTemplate> {
    const now = new Date().toISOString();
    const template: ReviewTemplate = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      scope: input.scope,
      checklistItems: buildChecklistItems(input.checklistItems),
      checklistItemCount: input.checklistItems.length,
      createdAt: now,
      updatedAt: now,
    };

    this.templates.push(template);

    return template;
  }

  async findAllMetadata(): Promise<ReviewTemplateMetadata[]> {
    return this.templates
      .map<ReviewTemplateMetadata>((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        scope: template.scope,
        checklistItemCount: template.checklistItemCount,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.id.localeCompare(a.id));
  }

  async findById(id: string): Promise<ReviewTemplate | undefined> {
    return this.templates.find((template) => template.id === id);
  }

  async update(id: string, input: UpdateReviewTemplateInput): Promise<ReviewTemplate | undefined> {
    const existing = this.templates.find((template) => template.id === id);

    if (!existing) {
      return undefined;
    }

    if (input.name !== undefined) {
      existing.name = input.name;
    }

    if (input.description !== undefined) {
      existing.description = input.description;
    }

    if (input.scope !== undefined) {
      existing.scope = input.scope;
    }

    if (input.checklistItems !== undefined) {
      existing.checklistItems = buildChecklistItems(input.checklistItems);
      existing.checklistItemCount = input.checklistItems.length;
    }

    existing.updatedAt = new Date().toISOString();

    return existing;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.templates.findIndex((template) => template.id === id);

    if (index < 0) {
      return false;
    }

    this.templates.splice(index, 1);

    return true;
  }
}
