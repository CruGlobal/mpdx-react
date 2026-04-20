import React from 'react';
import { render } from '@testing-library/react';
import { gqlMock } from '__tests__/util/graphqlMocking';
import { FilterList } from './FilterList';
import {
  UserOptionFragment,
  UserOptionFragmentDoc,
} from './FilterPanel.generated';

const buildFilter = (id: string, key: string): UserOptionFragment =>
  gqlMock<UserOptionFragment>(UserOptionFragmentDoc, { mocks: { id, key } });

const renderList = (filters: UserOptionFragment[]) =>
  render(
    <FilterList
      filters={filters}
      onFilterSelect={jest.fn()}
      onFilterDelete={jest.fn()}
    />,
  );

describe('FilterList', () => {
  it('renders translated labels for all known predefined filter ids', () => {
    const predefined: Array<[string, string]> = [
      ['pre-defined-filter-one-or-more-gifts', 'Gave One or More Gifts'],
      ['pre-defined-filter-given-in-last-2-years', 'Gave in the Last 2 Years'],
      ['pre-defined-filter-lost-partners', 'Lost Partners'],
      ['pre-defined-filter-last-full-12-months', 'Last Full 12 Months'],
      ['pre-defined-filter-last-full-month', 'Last Full Month'],
      ['pre-defined-filter-month-to-date', 'Month to Date'],
      ['pre-defined-filter-year-to-date', 'Year to Date'],
    ];
    const { getByRole } = renderList(
      predefined.map(([id]) =>
        buildFilter(id, 'saved_contacts_filter_Wrong_Name'),
      ),
    );
    predefined.forEach(([, label]) =>
      expect(getByRole('button', { name: label })).toBeInTheDocument(),
    );
  });

  it('falls back to the snake-cased key for non-predefined and unknown ids', () => {
    const { getByRole } = renderList([
      buildFilter('123', 'saved_contacts_filter_My_Cool_Filter'),
      buildFilter('456', 'graphql_saved_contacts_filter_GraphQL_Filter'),
      buildFilter(
        'pre-defined-filter-something-new',
        'saved_contacts_filter_Something_New',
      ),
    ]);
    expect(getByRole('button', { name: 'My Cool Filter' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'GraphQL Filter' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Something New' })).toBeInTheDocument();
  });

  it('shows the delete button only for non-predefined filters', () => {
    const { queryAllByRole } = renderList([
      buildFilter(
        'pre-defined-filter-lost-partners',
        'saved_contacts_filter_Lost_Partners',
      ),
      buildFilter('123', 'saved_contacts_filter_My_Cool_Filter'),
    ]);
    expect(queryAllByRole('button', { name: 'Delete' })).toHaveLength(1);
  });
});
