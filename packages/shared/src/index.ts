export interface Match {
  id: string;
  title: string;
  date: string;
  ruleset: string;
  competitorA: string;
  competitorB: string;
  notes: string;
}

export interface CreateMatchDto {
  title: string;
  date: string;
  ruleset: string;
  competitorA: string;
  competitorB: string;
  notes?: string;
}

export type UpdateMatchDto = Partial<CreateMatchDto>;

export type CompetitorSide = 'A' | 'B';

export interface TimelineEvent {
  id: string;
  matchId: string;
  timestamp: number;
  eventType: string;
  competitor: CompetitorSide;
  notes?: string;
}

export interface CreateTimelineEventDto {
  timestamp: number;
  eventType: string;
  competitor: CompetitorSide;
  notes?: string;
}

export type UpdateTimelineEventDto = Partial<CreateTimelineEventDto>;

export const POSITION_TYPES = [
  'standing',
  'closed_guard',
  'open_guard',
  'half_guard',
  'side_control',
  'mount',
  'back_control',
  'north_south',
  'leg_entanglement',
  'scramble',
] as const;

export type PositionType = (typeof POSITION_TYPES)[number];

export interface PositionState {
  id: string;
  matchId: string;
  position: PositionType;
  competitorTop: CompetitorSide;
  timestampStart: number;
  timestampEnd: number;
  notes?: string;
}

export interface CreatePositionStateDto {
  position: PositionType;
  competitorTop: CompetitorSide;
  timestampStart: number;
  timestampEnd: number;
  notes?: string;
}

export type UpdatePositionStateDto = Partial<CreatePositionStateDto>;

export interface MatchAnalyticsSummary {
  matchId: string;
  totalEventCount: number;
  eventCountsByType: Record<string, number>;
  totalPositionCount: number;
  timeInPositionByTypeSeconds: Record<PositionType, number>;
  competitorTopTimeByPositionSeconds: Record<CompetitorSide, Record<PositionType, number>>;
  totalTrackedPositionTimeSeconds: number;
}

export const MATCH_VIDEO_SOURCE_TYPES = ['remote_url', 'local_demo'] as const;
export type MatchVideoSourceType = (typeof MATCH_VIDEO_SOURCE_TYPES)[number];

export interface MatchVideo {
  id: string;
  matchId: string;
  title: string;
  sourceType: MatchVideoSourceType;
  sourceUrl: string;
  durationSeconds?: number;
  notes?: string;
}

export type MatchDatasetEvent = TimelineEvent;

export type MatchDatasetPosition = PositionState;

export interface MatchDatasetVideo {
  id: string;
  matchId: string;
  title: string;
  sourceType: MatchVideoSourceType;
  sourceUrl: string;
  durationSeconds?: number;
  notes?: string;
}

export interface MatchDatasetExport {
  match: Match;
  video: MatchDatasetVideo | null;
  events: MatchDatasetEvent[];
  positions: MatchDatasetPosition[];
  analytics: MatchAnalyticsSummary;
}

export const DATASET_VALIDATION_ISSUE_TYPES = [
  'EVENT_OUT_OF_RANGE',
  'POSITION_OVERLAP',
  'MISSING_VIDEO',
  'EMPTY_MATCH',
  'INVALID_TIMESTAMP_ORDER',
  'NEGATIVE_TIMESTAMP',
  'ANALYTICS_MISMATCH',
] as const;

export type DatasetValidationIssueType = (typeof DATASET_VALIDATION_ISSUE_TYPES)[number];

export const DATASET_VALIDATION_SEVERITIES = ['INFO', 'WARNING', 'ERROR'] as const;

export type DatasetValidationSeverity = (typeof DATASET_VALIDATION_SEVERITIES)[number];

export interface DatasetValidationIssue {
  type: DatasetValidationIssueType;
  severity: DatasetValidationSeverity;
  message: string;
  context?: Record<string, string | number | boolean | null>;
}

export interface DatasetValidationReport {
  matchId: string;
  isValid: boolean;
  issueCount: number;
  issues: DatasetValidationIssue[];
}

export interface CreateMatchVideoDto {
  title: string;
  sourceType: MatchVideoSourceType;
  sourceUrl: string;
  durationSeconds?: number;
  notes?: string;
}

export type UpdateMatchVideoDto = Partial<CreateMatchVideoDto>;

export {
  MAX_COMPETITOR_NAME_LENGTH,
  MAX_EVENT_TYPE_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_RULESET_LENGTH,
  MAX_SOURCE_URL_LENGTH,
  MAX_TITLE_LENGTH,
} from './security-constraints';
