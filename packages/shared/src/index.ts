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
