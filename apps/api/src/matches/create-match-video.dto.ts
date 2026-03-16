import type { CreateMatchVideoDto as SharedCreateMatchVideoDto } from '@scrambleiq/shared';

export class CreateMatchVideoDto implements SharedCreateMatchVideoDto {
  title!: string;
  sourceType!: 'remote_url' | 'local_demo';
  sourceUrl!: string;
  durationSeconds?: number;
  notes?: string;
}
