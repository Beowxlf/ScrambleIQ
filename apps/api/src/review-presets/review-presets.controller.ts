import { Body, Controller, Delete, Get, HttpCode, Inject, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import type { SavedReviewPreset, SavedReviewPresetMetadata } from '@scrambleiq/shared';

import { CreateReviewPresetDto } from './create-review-preset.dto';
import { ReviewPresetsService } from './review-presets.service';
import { UpdateReviewPresetDto } from './update-review-preset.dto';

@Controller('saved-review-presets')
export class ReviewPresetsController {
  constructor(@Inject(ReviewPresetsService) private readonly reviewPresetsService: ReviewPresetsService) {}

  @Post()
  create(@Body() createReviewPresetDto: CreateReviewPresetDto): Promise<SavedReviewPreset> {
    return this.reviewPresetsService.create(createReviewPresetDto);
  }

  @Get()
  findAll(): Promise<SavedReviewPresetMetadata[]> {
    return this.reviewPresetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SavedReviewPreset> {
    return this.reviewPresetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateReviewPresetDto: UpdateReviewPresetDto): Promise<SavedReviewPreset> {
    return this.reviewPresetsService.update(id, updateReviewPresetDto);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.reviewPresetsService.delete(id);
  }
}
