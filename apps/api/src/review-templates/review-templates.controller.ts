import { Body, Controller, Delete, Get, HttpCode, Inject, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import type { ReviewTemplate, ReviewTemplateMetadata } from '@scrambleiq/shared';

import { CreateReviewTemplateDto } from './create-review-template.dto';
import { ReviewTemplatesService } from './review-templates.service';
import { UpdateReviewTemplateDto } from './update-review-template.dto';

@Controller('review-templates')
export class ReviewTemplatesController {
  constructor(@Inject(ReviewTemplatesService) private readonly reviewTemplatesService: ReviewTemplatesService) {}

  @Post()
  create(@Body() createReviewTemplateDto: CreateReviewTemplateDto): Promise<ReviewTemplate> {
    return this.reviewTemplatesService.create(createReviewTemplateDto);
  }

  @Get()
  findAll(): Promise<ReviewTemplateMetadata[]> {
    return this.reviewTemplatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ReviewTemplate> {
    return this.reviewTemplatesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateReviewTemplateDto: UpdateReviewTemplateDto): Promise<ReviewTemplate> {
    return this.reviewTemplatesService.update(id, updateReviewTemplateDto);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.reviewTemplatesService.delete(id);
  }
}
