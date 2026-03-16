import type { UpdatePositionStateDto as SharedUpdatePositionStateDto } from '@scrambleiq/shared';

export class UpdatePositionStateDto implements SharedUpdatePositionStateDto {
  position?: SharedUpdatePositionStateDto['position'];
  competitorTop?: 'A' | 'B';
  timestampStart?: number;
  timestampEnd?: number;
  notes?: string;
}
