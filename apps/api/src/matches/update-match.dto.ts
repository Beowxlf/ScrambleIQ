import type { UpdateMatchDto as SharedUpdateMatchDto } from '@scrambleiq/shared';

export class UpdateMatchDto implements SharedUpdateMatchDto {
  title?: string;
  date?: string;
  ruleset?: string;
  competitorA?: string;
  competitorB?: string;
  notes?: string;
}
