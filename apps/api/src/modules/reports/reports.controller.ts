import { BadRequestException, Controller, Get, Inject, Param, Query } from '@nestjs/common';
import type {
  CollectionExportPayload,
  CollectionReviewSummary,
  CollectionValidationReport,
  CompetitorTrendSummary,
} from '@scrambleiq/shared';

import { CollectionExportQueryDto, CollectionReportQueryDto } from './reports-query.dto';
import { validateCollectionExportQuery, validateCollectionReportFilters } from './reports-query-validation';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(@Inject(ReportsService) private readonly reportsService: ReportsService) {}

  @Get('collection/summary')
  getCollectionSummary(@Query() query: CollectionReportQueryDto): Promise<CollectionReviewSummary> {
    const { value, errors } = validateCollectionReportFilters(query);

    if (!value || errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.reportsService.getCollectionSummary(value);
  }

  @Get('competitors/:competitorId/trends')
  getCompetitorTrends(
    @Param('competitorId') competitorId: string,
    @Query() query: CollectionReportQueryDto,
  ): Promise<CompetitorTrendSummary> {
    const { value, errors } = validateCollectionReportFilters(query);

    if (!value || errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.reportsService.getCompetitorTrendSummary(competitorId, value);
  }

  @Get('collection/validation')
  getCollectionValidation(@Query() query: CollectionReportQueryDto): Promise<CollectionValidationReport> {
    const { value, errors } = validateCollectionReportFilters(query);

    if (!value || errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.reportsService.getCollectionValidationReport(value);
  }

  @Get('collection/export')
  getCollectionExport(@Query() query: CollectionExportQueryDto): Promise<CollectionExportPayload> {
    const { value, errors } = validateCollectionExportQuery(query);

    if (!value || errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.reportsService.getCollectionExportPayload(value.filters, value.artifactType);
  }
}
