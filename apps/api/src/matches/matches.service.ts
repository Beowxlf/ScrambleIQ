import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CompetitorSide,
  DatasetValidationReport,
  Match,
  MatchAnalyticsSummary,
  MatchDatasetEvent,
  MatchDatasetExport,
  MatchDatasetPosition,
  MatchDatasetVideo,
  MatchListResponse,
  MatchReviewSummary,
  PositionType,
} from '@scrambleiq/shared';
import { POSITION_TYPES } from '@scrambleiq/shared';

import {
  DATASET_VALIDATION_REPOSITORY,
  DatasetValidationRepository,
} from '../repositories/dataset-validation.repository';
import { EventRepository, EVENT_REPOSITORY } from '../repositories/event.repository';
import { MatchRepository, MATCH_REPOSITORY } from '../repositories/match.repository';
import { PositionRepository, POSITION_REPOSITORY } from '../repositories/position.repository';
import { VideoRepository, VIDEO_REPOSITORY } from '../repositories/video.repository';
import { CreateMatchDto } from './create-match.dto';
import { DatasetValidationService } from './dataset-validation.service';
import { ValidatedMatchListQuery } from './list-matches-query-validation';
import { validateCreateMatchPayload, validateUpdateMatchPayload } from './match-validation';
import { UpdateMatchDto } from './update-match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @Inject(MATCH_REPOSITORY) private readonly matchRepository: MatchRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(POSITION_REPOSITORY) private readonly positionRepository: PositionRepository,
    @Inject(VIDEO_REPOSITORY) private readonly videoRepository: VideoRepository,
    @Inject(DATASET_VALIDATION_REPOSITORY)
    private readonly datasetValidationRepository: DatasetValidationRepository,
    @Inject(DatasetValidationService) private readonly datasetValidationService: DatasetValidationService,
  ) {}

  async create(input: CreateMatchDto): Promise<Match> {
    const errors = validateCreateMatchPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.matchRepository.create(input);
  }

  async findAll(query: ValidatedMatchListQuery): Promise<MatchListResponse> {
    const summaries = await this.matchRepository.findAllSummaries();

    const filtered = summaries.filter((summary) => {
      if (query.competitor) {
        const q = query.competitor.toLowerCase();
        const matchesCompetitor = summary.competitorA.toLowerCase().includes(q)
          || summary.competitorB.toLowerCase().includes(q);

        if (!matchesCompetitor) {
          return false;
        }
      }

      if (query.dateFrom && summary.eventDate < query.dateFrom) {
        return false;
      }

      if (query.dateTo && summary.eventDate > query.dateTo) {
        return false;
      }

      if (query.hasVideo !== undefined && summary.hasVideo !== query.hasVideo) {
        return false;
      }

      return true;
    });

    return {
      matches: filtered.slice(query.offset, query.offset + query.limit),
      total: filtered.length,
      limit: query.limit,
      offset: query.offset,
    };
  }

  async update(id: string, input: UpdateMatchDto): Promise<Match> {
    const errors = validateUpdateMatchPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const updatedMatch = await this.matchRepository.update(id, input);

    if (!updatedMatch) {
      throw new NotFoundException(`Match with id ${id} was not found.`);
    }

    return updatedMatch;
  }

  async validateDataset(id: string): Promise<DatasetValidationReport> {
    const analytics = await this.getAnalytics(id);
    const report = await this.datasetValidationService.validateMatchDataset(id, analytics);
    await this.datasetValidationRepository.upsert(id, report);
    return report;
  }

  async getReviewSummary(id: string): Promise<MatchReviewSummary> {
    const match = await this.matchRepository.findById(id);

    if (!match) {
      throw new NotFoundException(`Match with id ${id} was not found.`);
    }

    const analyticsPromise = this.getAnalytics(id);
    const [events, positions, video, analytics] = await Promise.all([
      this.eventRepository.findByMatchId(id),
      this.positionRepository.findByMatchId(id),
      this.videoRepository.findByMatchId(id),
      analyticsPromise,
    ]);
    const validation = await this.datasetValidationService.validateMatchDataset(id, analytics);

    const issueCountsBySeverity = validation.issues.reduce(
      (counts, issue) => {
        if (issue.severity === 'INFO') {
          counts.info += 1;
        } else if (issue.severity === 'WARNING') {
          counts.warning += 1;
        } else if (issue.severity === 'ERROR') {
          counts.error += 1;
        }

        return counts;
      },
      {
        info: 0,
        warning: 0,
        error: 0,
      },
    );

    return {
      match,
      eventCount: events.length,
      positionCount: positions.length,
      hasVideo: video !== null,
      analytics,
      validation: {
        isValid: validation.isValid,
        issueCount: validation.issueCount,
        issueCountsBySeverity,
      },
    };
  }

  async exportDataset(id: string): Promise<MatchDatasetExport> {
    const match = await this.matchRepository.findById(id);

    if (!match) {
      throw new NotFoundException(`Match with id ${id} was not found.`);
    }

    const events = (await this.eventRepository.findByMatchId(id))
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp) as MatchDatasetEvent[];

    const positions = (await this.positionRepository.findByMatchId(id))
      .slice()
      .sort((a, b) => a.timestampStart - b.timestampStart) as MatchDatasetPosition[];

    const video = ((await this.videoRepository.findByMatchId(id)) ?? null) as MatchDatasetVideo | null;

    return {
      match,
      video,
      events,
      positions,
      analytics: await this.getAnalytics(id),
    };
  }

  async getAnalytics(id: string): Promise<MatchAnalyticsSummary> {
    const match = await this.matchRepository.findById(id);

    if (!match) {
      throw new NotFoundException(`Match with id ${id} was not found.`);
    }

    const events = await this.eventRepository.findByMatchId(id);
    const positions = await this.positionRepository.findByMatchId(id);

    const eventCountsByType = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] ?? 0) + 1;
      return acc;
    }, {});

    const initPositionDurations = (): Record<PositionType, number> =>
      POSITION_TYPES.reduce<Record<PositionType, number>>((acc, positionType) => {
        acc[positionType] = 0;
        return acc;
      }, {} as Record<PositionType, number>);

    const initCompetitorBreakdown = (): Record<CompetitorSide, Record<PositionType, number>> => ({
      A: initPositionDurations(),
      B: initPositionDurations(),
    });

    const timeInPositionByTypeSeconds = initPositionDurations();
    const competitorTopTimeByPositionSeconds = initCompetitorBreakdown();

    let totalTrackedPositionTimeSeconds = 0;

    for (const position of positions) {
      const durationSeconds = position.timestampEnd - position.timestampStart;
      timeInPositionByTypeSeconds[position.position] += durationSeconds;
      competitorTopTimeByPositionSeconds[position.competitorTop][position.position] += durationSeconds;
      totalTrackedPositionTimeSeconds += durationSeconds;
    }

    return {
      matchId: id,
      totalEventCount: events.length,
      eventCountsByType,
      totalPositionCount: positions.length,
      timeInPositionByTypeSeconds,
      competitorTopTimeByPositionSeconds,
      totalTrackedPositionTimeSeconds,
    };
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchRepository.findById(id);

    if (!match) {
      throw new NotFoundException(`Match with id ${id} was not found.`);
    }

    return match;
  }

  async delete(id: string): Promise<void> {
    const isDeleted = await this.matchRepository.delete(id);

    if (!isDeleted) {
      throw new NotFoundException(`Match with id ${id} was not found.`);
    }
  }
}
