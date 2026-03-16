import type { CreateTimelineEventDto, TimelineEvent, UpdateTimelineEventDto } from '@scrambleiq/shared';

export interface EventStore {
  create(matchId: string, input: CreateTimelineEventDto): TimelineEvent;
  findByMatchId(matchId: string): TimelineEvent[];
  update(id: string, input: UpdateTimelineEventDto): TimelineEvent | undefined;
  delete(id: string): boolean;
  deleteByMatchId(matchId: string): void;
}
