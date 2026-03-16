import type { UpdateMatchVideoDto as SharedUpdateMatchVideoDto } from '@scrambleiq/shared';

export class UpdateMatchVideoDto implements SharedUpdateMatchVideoDto {
  title?: string;
  sourceType?: 'remote_url' | 'local_demo';
  sourceUrl?: string;
  durationSeconds?: number;
  notes?: string;
}
