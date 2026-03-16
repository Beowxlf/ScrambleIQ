import type { UpdateTimelineEventDto as SharedUpdateTimelineEventDto } from '@scrambleiq/shared';

export class UpdateTimelineEventDto implements SharedUpdateTimelineEventDto {
  timestamp?: number;
  eventType?: string;
  competitor?: 'A' | 'B';
  notes?: string;
}
