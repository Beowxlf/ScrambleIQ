import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  DATASET_VALIDATION_SEVERITIES,
  POSITION_TYPES,
  type CompetitorSide,
  type DatasetValidationIssue,
  type DatasetValidationReport,
  type MatchAnalyticsSummary,
  type PositionState,
  type PositionType,
  type TimelineEvent,
} from '@scrambleiq/shared';

import { EventRepository, EVENT_REPOSITORY } from '../repositories/event.repository';
import { MatchRepository, MATCH_REPOSITORY } from '../repositories/match.repository';
import { PositionRepository, POSITION_REPOSITORY } from '../repositories/position.repository';
import { VideoRepository, VIDEO_REPOSITORY } from '../repositories/video.repository';

@Injectable()
export class DatasetValidationService {
  constructor(
    @Inject(MATCH_REPOSITORY) private readonly matchRepository: MatchRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(POSITION_REPOSITORY) private readonly positionRepository: PositionRepository,
    @Inject(VIDEO_REPOSITORY) private readonly videoRepository: VideoRepository,
  ) {}

  async validateMatchDataset(matchId: string, analyticsSummary: MatchAnalyticsSummary): Promise<DatasetValidationReport> {
    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found.`);
    }

    const events = await this.eventRepository.findByMatchId(matchId);
    const positions = await this.positionRepository.findByMatchId(matchId);
    const video = await this.videoRepository.findByMatchId(matchId);

    const issues: DatasetValidationIssue[] = [];

    if (!video) {
      issues.push({
        type: 'MISSING_VIDEO',
        severity: 'WARNING',
        message: 'No video is attached to this match dataset.',
        context: { matchId },
      });
    }

    if (events.length === 0 && positions.length === 0) {
      issues.push({
        type: 'EMPTY_MATCH',
        severity: 'ERROR',
        message: 'Match must contain at least one annotation (event or position).',
        context: { eventCount: 0, positionCount: 0 },
      });
    }

    this.addSortingIssues(events, positions, issues);
    this.addTimestampIssues(events, positions, issues);
    this.addOverlapIssues(positions, issues);
    this.addEventRangeIssues(events, positions, issues);
    this.addAnalyticsMismatchIssues(matchId, events, positions, analyticsSummary, issues);

    const hasError = issues.some((issue) => issue.severity === DATASET_VALIDATION_SEVERITIES[2]);

    return {
      matchId,
      isValid: !hasError,
      issueCount: issues.length,
      issues,
    };
  }

  private addSortingIssues(events: TimelineEvent[], positions: PositionState[], issues: DatasetValidationIssue[]) {
    for (let index = 1; index < events.length; index += 1) {
      if (events[index].timestamp < events[index - 1].timestamp) {
        issues.push({
          type: 'INVALID_TIMESTAMP_ORDER',
          severity: 'ERROR',
          message: 'Events are not sorted by timestamp in ascending order.',
          context: { previousTimestamp: events[index - 1].timestamp, currentTimestamp: events[index].timestamp },
        });
        break;
      }
    }

    for (let index = 1; index < positions.length; index += 1) {
      if (positions[index].timestampStart < positions[index - 1].timestampStart) {
        issues.push({
          type: 'INVALID_TIMESTAMP_ORDER',
          severity: 'ERROR',
          message: 'Positions are not sorted by timestampStart in ascending order.',
          context: {
            previousTimestampStart: positions[index - 1].timestampStart,
            currentTimestampStart: positions[index].timestampStart,
          },
        });
        break;
      }
    }
  }

  private addTimestampIssues(events: TimelineEvent[], positions: PositionState[], issues: DatasetValidationIssue[]) {
    for (const event of events) {
      if (event.timestamp < 0) {
        issues.push({
          type: 'NEGATIVE_TIMESTAMP',
          severity: 'ERROR',
          message: 'Event timestamps must be non-negative.',
          context: { eventId: event.id, timestamp: event.timestamp },
        });
      }
    }

    for (const position of positions) {
      if (position.timestampStart < 0 || position.timestampEnd < 0) {
        issues.push({
          type: 'NEGATIVE_TIMESTAMP',
          severity: 'ERROR',
          message: 'Position timestamps must be non-negative.',
          context: {
            positionId: position.id,
            timestampStart: position.timestampStart,
            timestampEnd: position.timestampEnd,
          },
        });
      }

      if (position.timestampEnd <= position.timestampStart) {
        issues.push({
          type: 'INVALID_TIMESTAMP_ORDER',
          severity: 'ERROR',
          message: 'Position timestampEnd must be greater than timestampStart.',
          context: {
            positionId: position.id,
            timestampStart: position.timestampStart,
            timestampEnd: position.timestampEnd,
          },
        });
      }
    }
  }

  private addOverlapIssues(positions: PositionState[], issues: DatasetValidationIssue[]) {
    for (let index = 1; index < positions.length; index += 1) {
      const previous = positions[index - 1];
      const current = positions[index];

      if (current.timestampStart < previous.timestampEnd) {
        issues.push({
          type: 'POSITION_OVERLAP',
          severity: 'ERROR',
          message: 'Position segments overlap and must be non-overlapping.',
          context: {
            previousPositionId: previous.id,
            currentPositionId: current.id,
            previousEnd: previous.timestampEnd,
            currentStart: current.timestampStart,
          },
        });
      }
    }
  }

  private addEventRangeIssues(events: TimelineEvent[], positions: PositionState[], issues: DatasetValidationIssue[]) {
    if (positions.length === 0) {
      return;
    }

    for (const event of events) {
      const withinAnyPosition = positions.some(
        (position) => event.timestamp >= position.timestampStart && event.timestamp <= position.timestampEnd,
      );

      if (!withinAnyPosition) {
        issues.push({
          type: 'EVENT_OUT_OF_RANGE',
          severity: 'WARNING',
          message: 'Event timestamp does not fall within any position segment.',
          context: { eventId: event.id, timestamp: event.timestamp },
        });
      }
    }
  }

  private addAnalyticsMismatchIssues(
    matchId: string,
    events: TimelineEvent[],
    positions: PositionState[],
    summary: MatchAnalyticsSummary,
    issues: DatasetValidationIssue[],
  ) {
    const recalculated = this.buildAnalytics(matchId, events, positions);

    if (JSON.stringify(recalculated) !== JSON.stringify(summary)) {
      issues.push({
        type: 'ANALYTICS_MISMATCH',
        severity: 'ERROR',
        message: 'Analytics summary does not match values recomputed from current annotations.',
        context: {
          expectedTotalEventCount: recalculated.totalEventCount,
          actualTotalEventCount: summary.totalEventCount,
          expectedTotalPositionCount: recalculated.totalPositionCount,
          actualTotalPositionCount: summary.totalPositionCount,
        },
      });
    }
  }

  private buildAnalytics(matchId: string, events: TimelineEvent[], positions: PositionState[]): MatchAnalyticsSummary {
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
      matchId,
      totalEventCount: events.length,
      eventCountsByType,
      totalPositionCount: positions.length,
      timeInPositionByTypeSeconds,
      competitorTopTimeByPositionSeconds,
      totalTrackedPositionTimeSeconds,
    };
  }
}
