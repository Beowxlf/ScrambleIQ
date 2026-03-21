import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ReviewTemplate, ReviewTemplateMetadata } from '@scrambleiq/shared';

import {
  REVIEW_TEMPLATE_REPOSITORY,
  type CreateReviewTemplateInput,
  type ReviewTemplateRepository,
  type UpdateReviewTemplateInput,
} from '../repositories/review-template.repository';
import { CreateReviewTemplateDto } from './create-review-template.dto';
import { validateCreateReviewTemplatePayload, validateUpdateReviewTemplatePayload } from './review-template-validation';
import { UpdateReviewTemplateDto } from './update-review-template.dto';

@Injectable()
export class ReviewTemplatesService {
  constructor(
    @Inject(REVIEW_TEMPLATE_REPOSITORY)
    private readonly reviewTemplateRepository: ReviewTemplateRepository,
  ) {}

  async create(input: CreateReviewTemplateDto): Promise<ReviewTemplate> {
    const errors = validateCreateReviewTemplatePayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.reviewTemplateRepository.create(input as CreateReviewTemplateInput);
  }

  async findAll(): Promise<ReviewTemplateMetadata[]> {
    return this.reviewTemplateRepository.findAllMetadata();
  }

  async findOne(id: string): Promise<ReviewTemplate> {
    const template = await this.reviewTemplateRepository.findById(id);

    if (!template) {
      throw new NotFoundException(`Review template with id ${id} was not found.`);
    }

    return template;
  }

  async update(id: string, input: UpdateReviewTemplateDto): Promise<ReviewTemplate> {
    const errors = validateUpdateReviewTemplatePayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const template = await this.reviewTemplateRepository.update(id, input as UpdateReviewTemplateInput);

    if (!template) {
      throw new NotFoundException(`Review template with id ${id} was not found.`);
    }

    return template;
  }

  async delete(id: string): Promise<void> {
    const isDeleted = await this.reviewTemplateRepository.delete(id);

    if (!isDeleted) {
      throw new NotFoundException(`Review template with id ${id} was not found.`);
    }
  }
}
