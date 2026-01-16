import { formatCalculationDates } from './dateHelpers';

describe('formatCalculationDates', () => {
  const locale = 'en-US';

  it('returns N/A when calculation is null', () => {
    const result = formatCalculationDates(null, locale);

    expect(result).toEqual({
      requestedOn: 'N/A',
      processedOn: 'N/A',
    });
  });

  it('formats submittedAt date', () => {
    const calculation = {
      submittedAt: '2025-01-15T10:00:00Z',
      changesRequestedAt: null,
    };

    const result = formatCalculationDates(calculation, locale);

    expect(result.requestedOn).toBe('Jan 15, 2025');
  });

  it('formats changesRequestedAt when present', () => {
    const calculation = {
      submittedAt: '2025-01-15T10:00:00Z',
      changesRequestedAt: '2025-01-20T10:00:00Z',
    };

    const result = formatCalculationDates(calculation, locale);

    expect(result.processedOn).toBe('Jan 20, 2025');
  });

  it('returns N/A for invalid date strings', () => {
    const calculation = {
      submittedAt: 'invalid-date',
      changesRequestedAt: null,
    };

    const result = formatCalculationDates(calculation, locale);

    expect(result.requestedOn).toBe('N/A');
    expect(result.processedOn).toBe('N/A');
  });
});
