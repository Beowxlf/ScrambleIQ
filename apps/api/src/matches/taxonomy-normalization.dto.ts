import type { TaxonomyNormalizationAction } from '@scrambleiq/shared';

export class TaxonomyNormalizationDto {
  field!: 'eventType';

  fromValue!: string;

  toValue!: string;

  action!: TaxonomyNormalizationAction;
}
