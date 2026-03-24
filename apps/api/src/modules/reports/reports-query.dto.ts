export class CollectionReportQueryDto {
  dateFrom?: string;
  dateTo?: string;
  competitor?: string;
  ruleset?: string;
}

export class CollectionExportQueryDto extends CollectionReportQueryDto {
  artifactType?: string;
}
