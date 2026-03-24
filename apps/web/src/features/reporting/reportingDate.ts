export interface DateRangeInput {
  dateFrom: string;
  dateTo: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toIsoDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildDefaultDateRange(): DateRangeInput {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 30);

  return {
    dateFrom: toIsoDate(start),
    dateTo: toIsoDate(end),
  };
}

export function validateDateRange({ dateFrom, dateTo }: DateRangeInput): string | null {
  if (!dateFrom || !dateTo) {
    return 'Date from and date to are required.';
  }

  if (!DATE_PATTERN.test(dateFrom) || !DATE_PATTERN.test(dateTo)) {
    return 'Dates must use YYYY-MM-DD format.';
  }

  if (dateFrom > dateTo) {
    return 'Date from must be on or before date to.';
  }

  return null;
}
