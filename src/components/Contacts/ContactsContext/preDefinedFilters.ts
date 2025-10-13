import { UserOptionFragment } from '../../Shared/Filters/FilterPanel.generated';

export const getPreDefinedFilters = (): UserOptionFragment[] => [
  {
    id: 'pre-defined-filter-one-or-more-gifts',
    key: 'saved_contacts_filter_One_or_More_Gifts',
    value: JSON.stringify({
      donation: ['one'],
    }),
    __typename: 'Option' as const,
  },
  {
    id: 'pre-defined-filter-given-in-last-2-years',
    key: 'saved_contacts_filter_Given_in_the_Last_2_Years',
    value: JSON.stringify({
      donation: ['one'],
      donationDate: {
        min: new Date(new Date().setFullYear(new Date().getFullYear() - 2))
          .toISOString()
          .split('T')[0],
        max: new Date().toISOString().split('T')[0],
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
        min: new Date(new Date().setFullYear(new Date().getFullYear() - 3))
          .toISOString()
          .split('T')[0],
        max: new Date().toISOString().split('T')[0],
      },
    }),
    __typename: 'Option' as const,
  },
];
