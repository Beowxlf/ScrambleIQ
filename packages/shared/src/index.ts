export interface Match {
  id: string;
  title: string;
  date: string;
  ruleset: string;
  competitorA: string;
  competitorB: string;
  notes: string;
}

export interface CreateMatchDto {
  title: string;
  date: string;
  ruleset: string;
  competitorA: string;
  competitorB: string;
  notes?: string;
}

export type UpdateMatchDto = Partial<CreateMatchDto>;
