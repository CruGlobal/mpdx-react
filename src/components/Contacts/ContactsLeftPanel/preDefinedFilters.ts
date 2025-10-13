import { DateTime } from 'luxon';
import { UserOptionFragment } from '../../Shared/Filters/FilterPanel.generated';

export const preDefinedFilters: UserOptionFragment[] = [
  {
    id: 'pre-defined-filter-one-or-more-gifts',
    key: 'saved_contacts_filter_Gave_One_or_More_Gifts',
    value: JSON.stringify({
      donation: ['one'],
    }),
    __typename: 'Option' as const,
  },
  {
    id: 'pre-defined-filter-given-in-last-2-years',
    key: 'saved_contacts_filter_Gave_in_the_Last_2_Years',
    value: JSON.stringify({
      donation: ['one'],
      donationDate: {
        min: DateTime.now().minus({ years: 2 }).toISODate(),
        max: DateTime.now().toISODate(),
      },
    }),
    __typename: 'Option' as const,
  },
  {
    id: 'pre-defined-filter-lost-partners',
    key: 'saved_contacts_filter_Lost_Partners',
    value: JSON.stringify({
      donation: ['last'],
      donationDate: {
        min: DateTime.now().minus({ years: 3 }).toISODate(),
        max: DateTime.now().minus({ years: 1 }).toISODate(),
      },
    }),
    __typename: 'Option' as const,
  },
];
