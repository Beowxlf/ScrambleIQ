import type { CreateTimelineEventDto as SharedCreateTimelineEventDto } from '@scrambleiq/shared';

export class CreateTimelineEventDto implements SharedCreateTimelineEventDto {
  timestamp!: number;
  eventType!: string;
  competitor!: 'A' | 'B';
  notes?: string;
}
