import { DateTime } from 'luxon';
import { UserOptionFragment } from 'src/components/Shared/Filters/FilterPanel.generated';

export const preDefinedFilters: UserOptionFragment[] = [
  {
    id: 'pre-defined-filter-last-full-12-months',
    key: 'saved_contacts_filter_Last_Full_12_Months',
    value: JSON.stringify({
      donationDate: {
        min: DateTime.now().minus({ months: 12 }).startOf('month').toISODate(),
        max: DateTime.now().minus({ months: 1 }).endOf('month').toISODate(),
      },
    }),
    __typename: 'Option' as const,
  },
  {
    id: 'pre-defined-filter-last-full-month',
    key: 'saved_contacts_filter_Last_Full_Month',
    value: JSON.stringify({
      donationDate: {
        min: DateTime.now().minus({ months: 1 }).startOf('month').toISODate(),
        max: DateTime.now().minus({ months: 1 }).endOf('month').toISODate(),
      },
    }),
    __typename: 'Option' as const,
  },
  {
    id: 'pre-defined-filter-month-to-date',
    key: 'saved_contacts_filter_Month_to_Date',
    value: JSON.stringify({
      donationDate: {
        min: DateTime.now().startOf('month').toISODate(),
        max: DateTime.now().toISODate(),
      },
    }),
    __typename: 'Option' as const,
  },
  {
    id: 'pre-defined-filter-year-to-date',
    key: 'saved_contacts_filter_Year_to_Date',
    value: JSON.stringify({
      donationDate: {
        min: DateTime.now().startOf('year').toISODate(),
        max: DateTime.now().toISODate(),
      },
    }),
    __typename: 'Option' as const,
  },
];
