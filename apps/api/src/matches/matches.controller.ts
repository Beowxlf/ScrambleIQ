import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Inject, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import type { DatasetValidationReport, Match, MatchAnalyticsSummary, MatchDatasetExport, MatchListResponse, MatchReviewSummary } from '@scrambleiq/shared';

import { CreateMatchDto } from './create-match.dto';
import { MatchesService } from './matches.service';
import { UpdateMatchDto } from './update-match.dto';
import { ListMatchesQueryDto } from './list-matches-query.dto';
import { validateAndNormalizeListMatchesQuery } from './list-matches-query-validation';

@Controller('matches')
export class MatchesController {
  constructor(@Inject(MatchesService) private readonly matchesService: MatchesService) {}

  @Post()
  create(@Body() createMatchDto: CreateMatchDto): Promise<Match> {
    return this.matchesService.create(createMatchDto);
  }

  @Get()
  findAll(@Query() query: ListMatchesQueryDto): Promise<MatchListResponse> {
    const { value, errors } = validateAndNormalizeListMatchesQuery(query);

    if (!value || errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.matchesService.findAll(value);
  }


  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMatchDto: UpdateMatchDto): Promise<Match> {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Match> {
    return this.matchesService.findOne(id);
  }

  @Get(':id/analytics')
  getAnalytics(@Param('id', ParseUUIDPipe) id: string): Promise<MatchAnalyticsSummary> {
    return this.matchesService.getAnalytics(id);
  }

  @Get(':id/export')
  exportDataset(@Param('id', ParseUUIDPipe) id: string): Promise<MatchDatasetExport> {
    return this.matchesService.exportDataset(id);
  }

  @Get(':id/validate')
  validateDataset(@Param('id', ParseUUIDPipe) id: string): Promise<DatasetValidationReport> {
    return this.matchesService.validateDataset(id);
  }

  @Get(':id/review-summary')
  getReviewSummary(@Param('id', ParseUUIDPipe) id: string): Promise<MatchReviewSummary> {
    return this.matchesService.getReviewSummary(id);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.matchesService.delete(id);
  }
}
