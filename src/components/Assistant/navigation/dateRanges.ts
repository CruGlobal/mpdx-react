import { DateTime } from 'luxon';
import { Range } from './intents';

export interface DateRange {
  min: DateTime;
  max: DateTime;
}

// Matches the Gift Date presets the contacts filter panel offers
export const getDateRange = (range: Range, now: DateTime): DateRange => {
  const today = now.startOf('day');
  const lastMonth = today.minus({ months: 1 });
  switch (range) {
    case 'last_30_days':
      return { min: today.minus({ days: 30 }), max: today };
    case 'this_month':
      return { min: today.startOf('month'), max: today.endOf('month') };
    case 'last_month':
      return { min: lastMonth.startOf('month'), max: lastMonth.endOf('month') };
    case 'last_two_months':
      return {
        min: today.minus({ months: 2 }).startOf('month'),
        max: lastMonth.endOf('month'),
      };
    case 'last_three_months':
      return {
        min: today.minus({ months: 3 }).startOf('month'),
        max: lastMonth.endOf('month'),
      };
    case 'this_year':
      return { min: today.startOf('year'), max: today.endOf('year') };
    case 'last_year': {
      const lastYear = today.minus({ years: 1 });
      return { min: lastYear.startOf('year'), max: lastYear.endOf('year') };
    }
  }
};
