import { Injectable } from '@nestjs/common';
import type { SavedReviewPreset, SavedReviewPresetMetadata } from '@scrambleiq/shared';

import {
  type CreateReviewPresetInput,
  type ReviewPresetRepository,
  type UpdateReviewPresetInput,
} from './review-preset.repository';

@Injectable()
export class InMemoryReviewPresetRepository implements ReviewPresetRepository {
  constructor(private readonly presets: SavedReviewPreset[]) {}

  async create(input: CreateReviewPresetInput): Promise<SavedReviewPreset> {
    const now = new Date().toISOString();
    const preset: SavedReviewPreset = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      scope: input.scope,
      config: structuredClone(input.config),
      createdAt: now,
      updatedAt: now,
    };

    this.presets.push(preset);

    return preset;
  }

  async findAllMetadata(): Promise<SavedReviewPresetMetadata[]> {
    return this.presets
      .map<SavedReviewPresetMetadata>((preset) => ({
        id: preset.id,
        name: preset.name,
        description: preset.description,
        scope: preset.scope,
        createdAt: preset.createdAt,
        updatedAt: preset.updatedAt,
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.id.localeCompare(a.id));
  }

  async findById(id: string): Promise<SavedReviewPreset | undefined> {
    return this.presets.find((preset) => preset.id === id);
  }

  async update(id: string, input: UpdateReviewPresetInput): Promise<SavedReviewPreset | undefined> {
    const existing = this.presets.find((preset) => preset.id === id);

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

    if (input.config !== undefined) {
      existing.config = structuredClone(input.config);
    }

    existing.updatedAt = new Date().toISOString();

    return existing;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.presets.findIndex((preset) => preset.id === id);

    if (index < 0) {
      return false;
    }

    this.presets.splice(index, 1);

    return true;
  }
}
