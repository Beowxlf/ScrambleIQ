import type { CreateMatchDto as SharedCreateMatchDto } from '@scrambleiq/shared';

export class CreateMatchDto implements SharedCreateMatchDto {
  title!: string;
  date!: string;
  ruleset!: string;
  competitorA!: string;
  competitorB!: string;
  notes?: string;
}
