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

export {
  MAX_COMPETITOR_NAME_LENGTH,
  MAX_EVENT_TYPE_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_RULESET_LENGTH,
  MAX_TITLE_LENGTH,
} from './security-constraints';
