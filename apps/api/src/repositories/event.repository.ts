import type { CreateTimelineEventDto, TimelineEvent, UpdateTimelineEventDto } from '@scrambleiq/shared';

export interface EventRepository {
  create(matchId: string, input: CreateTimelineEventDto): Promise<TimelineEvent>;
  findByMatchId(matchId: string): Promise<TimelineEvent[]>;
  findById(id: string): Promise<TimelineEvent | undefined>;
  update(id: string, input: UpdateTimelineEventDto): Promise<TimelineEvent | undefined>;
  delete(id: string): Promise<boolean>;
}

export const EVENT_REPOSITORY = Symbol('EVENT_REPOSITORY');
