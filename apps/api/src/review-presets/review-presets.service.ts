import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { SavedReviewPreset, SavedReviewPresetMetadata } from '@scrambleiq/shared';

import {
  REVIEW_PRESET_REPOSITORY,
  type CreateReviewPresetInput,
  type ReviewPresetRepository,
  type UpdateReviewPresetInput,
} from '../repositories/review-preset.repository';
import { CreateReviewPresetDto } from './create-review-preset.dto';
import { validateCreateReviewPresetPayload, validateUpdateReviewPresetPayload } from './review-preset-validation';
import { UpdateReviewPresetDto } from './update-review-preset.dto';

@Injectable()
export class ReviewPresetsService {
  constructor(
    @Inject(REVIEW_PRESET_REPOSITORY)
    private readonly reviewPresetRepository: ReviewPresetRepository,
  ) {}

  async create(input: CreateReviewPresetDto): Promise<SavedReviewPreset> {
    const errors = validateCreateReviewPresetPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.reviewPresetRepository.create(input as CreateReviewPresetInput);
  }

  async findAll(): Promise<SavedReviewPresetMetadata[]> {
    return this.reviewPresetRepository.findAllMetadata();
  }

  async findOne(id: string): Promise<SavedReviewPreset> {
    const preset = await this.reviewPresetRepository.findById(id);

    if (!preset) {
      throw new NotFoundException(`Saved review preset with id ${id} was not found.`);
    }

    return preset;
  }

  async update(id: string, input: UpdateReviewPresetDto): Promise<SavedReviewPreset> {
    const errors = validateUpdateReviewPresetPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const preset = await this.reviewPresetRepository.update(id, input as UpdateReviewPresetInput);

    if (!preset) {
      throw new NotFoundException(`Saved review preset with id ${id} was not found.`);
    }

    return preset;
  }

  async delete(id: string): Promise<void> {
    const isDeleted = await this.reviewPresetRepository.delete(id);

    if (!isDeleted) {
      throw new NotFoundException(`Saved review preset with id ${id} was not found.`);
    }
  }
}
