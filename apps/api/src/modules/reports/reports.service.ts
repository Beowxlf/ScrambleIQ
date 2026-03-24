import { Inject, Injectable } from '@nestjs/common';
import {
  COMPETITOR_TREND_WINDOWS,
  POSITION_TYPES,
  type CollectionExportPayload,
  type CollectionReportFilters,
  type CollectionReviewSummary,
  type CollectionValidationIssueCountsBySeverity,
  type CollectionValidationReport,
  type CompetitorTrendSummary,
  type DatasetValidationIssue,
  type DatasetValidationReport,
  type EventTypeDistributionEntry,
  type Match,
  type MatchDatasetExport,
  type PositionState,
  type PositionTimeDistributionEntry,
  type ReportArtifactType,
  type TimelineEvent,
} from '@scrambleiq/shared';

import { DatasetValidationService } from '../../matches/dataset-validation.service';
import { MatchesService } from '../../matches/matches.service';
import { EventRepository, EVENT_REPOSITORY } from '../../repositories/event.repository';
import { MatchRepository, MATCH_REPOSITORY } from '../../repositories/match.repository';
import { PositionRepository, POSITION_REPOSITORY } from '../../repositories/position.repository';
import { VideoRepository, VIDEO_REPOSITORY } from '../../repositories/video.repository';

interface LoadedMatchDataset {
  match: Match;
  events: TimelineEvent[];
  positions: PositionState[];
  hasVideo: boolean;
}

@Injectable()
export class ReportsService {
  private readonly minimumTrendMatchCount = 3;
  private readonly dominantShareThreshold = 0.4;
  private readonly minimumCollectionInsightMatchCount = 2;
  private readonly lowActivityEventsPerMatchThreshold = 1.5;
  private readonly highActivityEventsPerMatchThreshold = 6;
  private readonly activityPatternMinMatchCount = 3;
  private readonly trendChangeThresholdPercent = 15;
  private readonly minimumTrendBaselineCount = 4;
  private readonly highValidationErrorRateThreshold = 0.25;
  private readonly recurringValidationIssueRateThreshold = 0.3;

  constructor(
    @Inject(MATCH_REPOSITORY) private readonly matchRepository: MatchRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(POSITION_REPOSITORY) private readonly positionRepository: PositionRepository,
    @Inject(VIDEO_REPOSITORY) private readonly videoRepository: VideoRepository,
    @Inject(MatchesService) private readonly matchesService: MatchesService,
    @Inject(DatasetValidationService) private readonly datasetValidationService: DatasetValidationService,
  ) {}

  async getCollectionSummary(filters: CollectionReportFilters): Promise<CollectionReviewSummary> {
    const datasets = await this.loadCollectionDatasets(filters);
    return this.buildCollectionSummary(filters, datasets);
  }

  async getCompetitorTrendSummary(competitorId: string, filters: CollectionReportFilters): Promise<CompetitorTrendSummary> {
    const currentWindow = this.resolveWindow(filters.dateRange.startDate, filters.dateRange.endDate);
    const previousWindow = this.resolvePreviousWindow(currentWindow.startDate, currentWindow.endDate);

    const scopedFilters: CollectionReportFilters = {
      ...filters,
      competitor: competitorId,
    };

    const currentDatasets = await this.loadCollectionDatasets({
      ...scopedFilters,
      dateRange: currentWindow,
    });

    const previousDatasets = await this.loadCollectionDatasets({
      ...scopedFilters,
      dateRange: previousWindow,
    });

    const currentSummary = this.buildCollectionSummary(
      {
        ...scopedFilters,
        dateRange: currentWindow,
      },
      currentDatasets,
    );

    const previousSummary = this.buildCollectionSummary(
      {
        ...scopedFilters,
        dateRange: previousWindow,
      },
      previousDatasets,
    );

    const currentEventDistribution = new Map(
      currentSummary.eventTypeDistribution.map((entry) => [entry.eventType, entry.count] as const),
    );
    const previousEventDistribution = new Map(
      previousSummary.eventTypeDistribution.map((entry) => [entry.eventType, entry.count] as const),
    );

    const eventTypes = new Set([...currentEventDistribution.keys(), ...previousEventDistribution.keys()]);

    const eventTypeDeltas = Array.from(eventTypes)
      .sort((left, right) => left.localeCompare(right))
      .map((eventType) => {
        const currentCount = currentEventDistribution.get(eventType) ?? 0;
        const previousCount = previousEventDistribution.get(eventType) ?? 0;

        return {
          eventType,
          currentCount,
          previousCount,
          deltaCount: currentCount - previousCount,
        };
      });

    const currentPositionDistribution = new Map(
      currentSummary.positionTimeDistribution.map((entry) => [entry.position, entry.durationSeconds] as const),
    );
    const previousPositionDistribution = new Map(
      previousSummary.positionTimeDistribution.map((entry) => [entry.position, entry.durationSeconds] as const),
    );

    const positionTimeDeltas = POSITION_TYPES
      .filter((position) => (currentPositionDistribution.get(position) ?? 0) > 0
        || (previousPositionDistribution.get(position) ?? 0) > 0)
      .map((position) => {
        const currentDurationSeconds = currentPositionDistribution.get(position) ?? 0;
        const previousDurationSeconds = previousPositionDistribution.get(position) ?? 0;

        return {
          position,
          currentDurationSeconds,
          previousDurationSeconds,
          deltaDurationSeconds: currentDurationSeconds - previousDurationSeconds,
        };
      });

    const observedMatchCount = currentSummary.totals.matchCount;
    const isSufficient = observedMatchCount >= this.minimumTrendMatchCount;

    return {
      filters: scopedFilters,
      competitor: competitorId,
      windows: [
        {
          window: COMPETITOR_TREND_WINDOWS[0],
          dateRange: currentWindow,
          matchCount: currentSummary.totals.matchCount,
          eventTypeDistribution: currentSummary.eventTypeDistribution,
          positionTimeDistribution: currentSummary.positionTimeDistribution,
        },
        {
          window: COMPETITOR_TREND_WINDOWS[1],
          dateRange: previousWindow,
          matchCount: previousSummary.totals.matchCount,
          eventTypeDistribution: previousSummary.eventTypeDistribution,
          positionTimeDistribution: previousSummary.positionTimeDistribution,
        },
      ],
      eventTypeDeltas,
      positionTimeDeltas,
      insights: this.buildTrendInsights({
        currentWindow,
        previousWindow,
        eventTypeDeltas,
        positionTimeDeltas,
        observedMatchCount,
      }),
      dataSufficiency: {
        minimumMatchCount: this.minimumTrendMatchCount,
        observedMatchCount,
        isSufficient,
        message: isSufficient
          ? 'Sample size is sufficient for trend interpretation.'
          : `Low sample size in current window (${observedMatchCount}/${this.minimumTrendMatchCount} matches).`,
      },
    };
  }

  async getCollectionValidationReport(filters: CollectionReportFilters): Promise<CollectionValidationReport> {
    const datasets = await this.loadCollectionDatasets(filters);

    if (datasets.length === 0) {
      return {
        filters,
        isValid: true,
        issueCount: 0,
        issueCountsBySeverity: {
          info: 0,
          warning: 0,
          error: 0,
        },
        issueCountsByType: [],
        matches: [],
        insights: [],
      };
    }

    const matchReports = await Promise.all(datasets.map(async (dataset) => {
      const analytics = await this.matchesService.getAnalytics(dataset.match.id);
      return this.datasetValidationService.validateMatchDataset(dataset.match.id, analytics);
    }));

    const issueCountsBySeverity: CollectionValidationIssueCountsBySeverity = {
      info: 0,
      warning: 0,
      error: 0,
    };

    const issueCountByTypeMap = new Map<string, number>();

    matchReports.forEach((report) => {
      report.issues.forEach((issue) => {
        this.applySeverityIssueCount(issue, issueCountsBySeverity);
        issueCountByTypeMap.set(issue.type, (issueCountByTypeMap.get(issue.type) ?? 0) + 1);
      });
    });

    const issueCount = issueCountsBySeverity.info + issueCountsBySeverity.warning + issueCountsBySeverity.error;

    const collectionValidationReport: CollectionValidationReport = {
      filters,
      isValid: issueCountsBySeverity.error === 0,
      issueCount,
      issueCountsBySeverity,
      issueCountsByType: Array
        .from(issueCountByTypeMap.entries())
        .sort(([leftType], [rightType]) => leftType.localeCompare(rightType))
        .map(([type, count]) => ({
          type: type as DatasetValidationIssue['type'],
          count,
        })),
      matches: matchReports
        .map((report) => {
          const perMatchIssueCounts: CollectionValidationIssueCountsBySeverity = {
            info: 0,
            warning: 0,
            error: 0,
          };

          report.issues.forEach((issue) => this.applySeverityIssueCount(issue, perMatchIssueCounts));

          return {
            matchId: report.matchId,
            isValid: report.isValid,
            issueCount: report.issueCount,
            issueCountsBySeverity: perMatchIssueCounts,
          };
        })
        .sort((left, right) => left.matchId.localeCompare(right.matchId)),
      insights: [],
    };

    return {
      ...collectionValidationReport,
      insights: this.buildValidationInsights(collectionValidationReport, matchReports),
    };
  }

  async getCollectionExportPayload(
    filters: CollectionReportFilters,
    artifactType: ReportArtifactType,
  ): Promise<CollectionExportPayload> {
    const summary = await this.getCollectionSummary(filters);
    const validation = await this.getCollectionValidationReport(filters);
    const matches = await this.getFilteredMatchExports(filters);

    return {
      metadata: {
        schemaVersion: 'phase4.v1',
        artifactType,
        filters,
        matchOrder: 'date_then_match_id',
      },
      summary,
      validation,
      matches,
    };
  }

  private async getFilteredMatchExports(filters: CollectionReportFilters): Promise<MatchDatasetExport[]> {
    const matches = await this.getFilteredMatches(filters);

    const sorted = matches
      .slice()
      .sort((left, right) => left.date.localeCompare(right.date) || left.id.localeCompare(right.id));

    return Promise.all(sorted.map((match) => this.matchesService.exportDataset(match.id)));
  }

  private async loadCollectionDatasets(filters: CollectionReportFilters): Promise<LoadedMatchDataset[]> {
    const matches = await this.getFilteredMatches(filters);

    return Promise.all(matches.map(async (match) => {
      const [events, positions, video] = await Promise.all([
        this.eventRepository.findByMatchId(match.id),
        this.positionRepository.findByMatchId(match.id),
        this.videoRepository.findByMatchId(match.id),
      ]);

      return {
        match,
        events,
        positions,
        hasVideo: video !== undefined,
      };
    }));
  }

  private async getFilteredMatches(filters: CollectionReportFilters): Promise<Match[]> {
    const matches = await this.matchRepository.findAll();

    return matches.filter((match) => {
      if (match.date < filters.dateRange.startDate || match.date > filters.dateRange.endDate) {
        return false;
      }

      if (filters.competitor) {
        const q = filters.competitor.toLowerCase();
        const matchesCompetitor = match.competitorA.toLowerCase().includes(q)
          || match.competitorB.toLowerCase().includes(q);

        if (!matchesCompetitor) {
          return false;
        }
      }

      if (filters.ruleset && match.ruleset.toLowerCase() !== filters.ruleset.toLowerCase()) {
        return false;
      }

      return true;
    });
  }

  private buildCollectionSummary(filters: CollectionReportFilters, datasets: LoadedMatchDataset[]): CollectionReviewSummary {
    if (datasets.length === 0) {
      return {
        filters,
        totals: {
          matchCount: 0,
          eventCount: 0,
          positionCount: 0,
          trackedPositionTimeSeconds: 0,
          videoAttachedCount: 0,
        },
        eventTypeDistribution: [],
        positionTimeDistribution: [],
        insights: [],
        isEmpty: true,
        emptyStateMessage: 'No matches found for the provided filter range.',
      };
    }

    const eventTypeDistribution = this.buildEventTypeDistribution(datasets.flatMap((dataset) => dataset.events));
    const positionTimeDistribution = this.buildPositionTimeDistribution(datasets.flatMap((dataset) => dataset.positions));

    const summary: CollectionReviewSummary = {
      filters,
      totals: {
        matchCount: datasets.length,
        eventCount: datasets.reduce((sum, dataset) => sum + dataset.events.length, 0),
        positionCount: datasets.reduce((sum, dataset) => sum + dataset.positions.length, 0),
        trackedPositionTimeSeconds: positionTimeDistribution.reduce((sum, entry) => sum + entry.durationSeconds, 0),
        videoAttachedCount: datasets.filter((dataset) => dataset.hasVideo).length,
      },
      eventTypeDistribution,
      positionTimeDistribution,
      insights: [],
      isEmpty: false,
    };

    return {
      ...summary,
      insights: this.buildCollectionInsights(summary),
    };
  }

  private buildCollectionInsights(summary: CollectionReviewSummary): string[] {
    if (summary.isEmpty) {
      return [];
    }

    const prioritizedInsights: Array<{ message: string; priority: number }> = [];

    const dominantEvent = summary.eventTypeDistribution
      .slice()
      .sort((left, right) => right.count - left.count || left.eventType.localeCompare(right.eventType))[0];
    if (dominantEvent && summary.totals.eventCount > 0 && summary.totals.matchCount >= this.minimumCollectionInsightMatchCount) {
      const eventShare = (dominantEvent.count / summary.totals.eventCount) * 100;

      if (eventShare >= this.dominantShareThreshold * 100) {
        prioritizedInsights.push({
          message: `${this.toSentenceCase(dominantEvent.eventType)} represents ${eventShare.toFixed(1)}% of tagged events. Prioritize counters and follow-up sequences around this recurring pattern.`,
          priority: eventShare,
        });
      }
    }

    const dominantPosition = summary.positionTimeDistribution
      .slice()
      .sort((left, right) => right.durationSeconds - left.durationSeconds || left.position.localeCompare(right.position))[0];

    if (
      dominantPosition
      && summary.totals.trackedPositionTimeSeconds > 0
      && summary.totals.matchCount >= this.minimumCollectionInsightMatchCount
    ) {
      const positionShare = (dominantPosition.durationSeconds / summary.totals.trackedPositionTimeSeconds) * 100;

      if (positionShare >= this.dominantShareThreshold * 100) {
        prioritizedInsights.push({
          message: `${this.toSentenceCase(dominantPosition.position)} accounts for ${positionShare.toFixed(1)}% of tracked position time. Plan drills around entries, exits, and scoring decisions from this position.`,
          priority: positionShare,
        });
      }
    }

    if (summary.totals.matchCount >= this.activityPatternMinMatchCount) {
      const eventsPerMatch = summary.totals.eventCount / summary.totals.matchCount;

      if (eventsPerMatch <= this.lowActivityEventsPerMatchThreshold) {
        prioritizedInsights.push({
          message: `Average event volume is ${eventsPerMatch.toFixed(1)} per match, which is low for this window. Audit tagging consistency before acting on trend conclusions.`,
          priority: (this.lowActivityEventsPerMatchThreshold - eventsPerMatch) * 10 + 10,
        });
      } else if (eventsPerMatch >= this.highActivityEventsPerMatchThreshold) {
        prioritizedInsights.push({
          message: `Average event volume is ${eventsPerMatch.toFixed(1)} per match, which is unusually high. Verify whether this reflects real pace change or over-tagging before planning adjustments.`,
          priority: (eventsPerMatch - this.highActivityEventsPerMatchThreshold) * 10 + 10,
        });
      }
    }

    return this.sortPrioritizedInsights(prioritizedInsights);
  }

  private buildTrendInsights(input: {
    currentWindow: { startDate: string; endDate: string };
    previousWindow: { startDate: string; endDate: string };
    eventTypeDeltas: CompetitorTrendSummary['eventTypeDeltas'];
    positionTimeDeltas: CompetitorTrendSummary['positionTimeDeltas'];
    observedMatchCount: number;
  }): string[] {
    if (input.observedMatchCount < this.minimumTrendMatchCount) {
      return [];
    }

    const prioritizedInsights: Array<{ message: string; priority: number }> = [];

    input.eventTypeDeltas.forEach((delta) => {
      if (delta.previousCount < this.minimumTrendBaselineCount) {
        return;
      }

      const deltaPercent = ((delta.currentCount - delta.previousCount) / delta.previousCount) * 100;
      if (Math.abs(deltaPercent) < this.trendChangeThresholdPercent) {
        return;
      }

      const direction = deltaPercent > 0 ? 'increased' : 'decreased';
      prioritizedInsights.push({
        message: `${this.toSentenceCase(delta.eventType)} ${direction} ${Math.abs(deltaPercent).toFixed(1)}% from ${input.previousWindow.startDate}–${input.previousWindow.endDate} to ${input.currentWindow.startDate}–${input.currentWindow.endDate}. Adjust game-planning focus for this action immediately.`,
        priority: Math.abs(deltaPercent),
      });
    });

    input.positionTimeDeltas.forEach((delta) => {
      if (delta.previousDurationSeconds < this.minimumTrendBaselineCount) {
        return;
      }

      const deltaPercent = ((delta.currentDurationSeconds - delta.previousDurationSeconds) / delta.previousDurationSeconds) * 100;
      if (Math.abs(deltaPercent) < this.trendChangeThresholdPercent) {
        return;
      }

      const direction = deltaPercent > 0 ? 'increased' : 'decreased';
      prioritizedInsights.push({
        message: `${this.toSentenceCase(delta.position)} control time ${direction} ${Math.abs(deltaPercent).toFixed(1)}% from ${input.previousWindow.startDate}–${input.previousWindow.endDate} to ${input.currentWindow.startDate}–${input.currentWindow.endDate}. Update positional strategy and training emphasis accordingly.`,
        priority: Math.abs(deltaPercent),
      });
    });

    return this.sortPrioritizedInsights(prioritizedInsights);
  }

  private buildValidationInsights(
    report: CollectionValidationReport,
    matchReports: DatasetValidationReport[],
  ): string[] {
    if (report.matches.length === 0) {
      return [];
    }

    const prioritizedInsights: Array<{ message: string; priority: number }> = [];
    const totalMatches = report.matches.length;
    const errorMatches = report.matches.filter((entry) => entry.issueCountsBySeverity.error > 0).length;
    const errorRate = errorMatches / totalMatches;

    if (errorRate >= this.highValidationErrorRateThreshold) {
      prioritizedInsights.push({
        message: `${(errorRate * 100).toFixed(1)}% of matches include validation errors. Resolve error-level issues before using this report for tactical decisions.`,
        priority: errorRate * 100 + 100,
      });
    }

    const matchesByIssueType = new Map<string, Set<string>>();
    matchReports.forEach((matchReport) => {
      const uniqueIssueTypes = new Set(matchReport.issues.map((issue) => issue.type));
      uniqueIssueTypes.forEach((issueType) => {
        const existing = matchesByIssueType.get(issueType) ?? new Set<string>();
        existing.add(matchReport.matchId);
        matchesByIssueType.set(issueType, existing);
      });
    });

    matchesByIssueType.forEach((matchIds, issueType) => {
      const rate = matchIds.size / totalMatches;
      if (rate < this.recurringValidationIssueRateThreshold) {
        return;
      }

      prioritizedInsights.push({
        message: `${this.toSentenceCase(issueType)} appears in ${(rate * 100).toFixed(1)}% of matches. Address this recurring issue type in the data capture process.`,
        priority: rate * 100,
      });
    });

    return this.sortPrioritizedInsights(prioritizedInsights);
  }

  private sortPrioritizedInsights(prioritizedInsights: Array<{ message: string; priority: number }>): string[] {
    return prioritizedInsights
      .slice()
      .sort((left, right) => right.priority - left.priority || left.message.localeCompare(right.message))
      .map((entry) => entry.message);
  }

  private buildEventTypeDistribution(events: TimelineEvent[]): EventTypeDistributionEntry[] {
    const counts = events.reduce<Map<string, number>>((acc, event) => {
      acc.set(event.eventType, (acc.get(event.eventType) ?? 0) + 1);
      return acc;
    }, new Map());

    return Array
      .from(counts.entries())
      .sort(([leftEventType], [rightEventType]) => leftEventType.localeCompare(rightEventType))
      .map(([eventType, count]) => ({ eventType, count }));
  }

  private buildPositionTimeDistribution(positions: PositionState[]): PositionTimeDistributionEntry[] {
    const durationByPosition = positions.reduce<Map<PositionState['position'], number>>((acc, position) => {
      acc.set(position.position, (acc.get(position.position) ?? 0) + (position.timestampEnd - position.timestampStart));
      return acc;
    }, new Map());

    return POSITION_TYPES
      .filter((position) => (durationByPosition.get(position) ?? 0) > 0)
      .map((position) => ({
        position,
        durationSeconds: durationByPosition.get(position) ?? 0,
      }));
  }

  private resolveWindow(startDate: string, endDate: string): { startDate: string; endDate: string } {
    return {
      startDate,
      endDate,
    };
  }

  private resolvePreviousWindow(startDate: string, endDate: string): { startDate: string; endDate: string } {
    const start = this.toUtcDate(startDate);
    const end = this.toUtcDate(endDate);

    const daySpan = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;

    const previousEnd = new Date(start.getTime() - 86_400_000);
    const previousStart = new Date(previousEnd.getTime() - (daySpan - 1) * 86_400_000);

    return {
      startDate: this.toIsoDate(previousStart),
      endDate: this.toIsoDate(previousEnd),
    };
  }

  private toUtcDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private toIsoDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private toSentenceCase(value: string): string {
    return value
      .replaceAll('_', ' ')
      .trim()
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  private applySeverityIssueCount(
    issue: DatasetValidationIssue,
    counts: CollectionValidationIssueCountsBySeverity,
  ): void {
    if (issue.severity === 'INFO') {
      counts.info += 1;
      return;
    }

    if (issue.severity === 'WARNING') {
      counts.warning += 1;
      return;
    }

    counts.error += 1;
  }
}
