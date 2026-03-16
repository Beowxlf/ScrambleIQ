import type { CreatePositionStateDto as SharedCreatePositionStateDto } from '@scrambleiq/shared';

export class CreatePositionStateDto implements SharedCreatePositionStateDto {
  position!: SharedCreatePositionStateDto['position'];
  competitorTop!: 'A' | 'B';
  timestampStart!: number;
  timestampEnd!: number;
  notes?: string;
}
