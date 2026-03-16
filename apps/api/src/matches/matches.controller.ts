import { Body, Controller, Delete, Get, HttpCode, Inject, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import type { DatasetValidationReport, Match, MatchAnalyticsSummary, MatchDatasetExport } from '@scrambleiq/shared';

import { CreateMatchDto } from './create-match.dto';
import { MatchesService } from './matches.service';
import { UpdateMatchDto } from './update-match.dto';

@Controller('matches')
export class MatchesController {
  constructor(@Inject(MatchesService) private readonly matchesService: MatchesService) {}

  @Post()
  create(@Body() createMatchDto: CreateMatchDto): Match {
    return this.matchesService.create(createMatchDto);
  }

  @Get()
  findAll(): Match[] {
    return this.matchesService.findAll();
  }


  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMatchDto: UpdateMatchDto): Match {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Match {
    return this.matchesService.findOne(id);
  }

  @Get(':id/analytics')
  getAnalytics(@Param('id', ParseUUIDPipe) id: string): MatchAnalyticsSummary {
    return this.matchesService.getAnalytics(id);
  }

  @Get(':id/export')
  exportDataset(@Param('id', ParseUUIDPipe) id: string): MatchDatasetExport {
    return this.matchesService.exportDataset(id);
  }

  @Get(':id/validate')
  validateDataset(@Param('id', ParseUUIDPipe) id: string): DatasetValidationReport {
    return this.matchesService.validateDataset(id);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', ParseUUIDPipe) id: string): void {
    this.matchesService.delete(id);
  }
}
