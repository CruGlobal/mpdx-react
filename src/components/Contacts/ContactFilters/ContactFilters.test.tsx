import React from 'react';
import { render } from '@testing-library/react';
import matchMediaMock from '../../../../__tests__/util/matchMediaMock';
import { ContactFiltersQuery } from '../../../../pages/accountLists/[accountListId]/ContactFilters.generated';
import ContactFilters from './ContactFilters';

const data: ContactFiltersQuery = {
  contactFilters: [
    { id: '1', name: 'Late Commitments' },
    { id: '2', name: 'Status' },
  ],
};

const loadFilters = jest.fn();

describe('ContactFilters', () => {
  beforeEach(() => {
    matchMediaMock({ width: '1024px' });
  });

  it('default', async () => {
    const { queryByTestId } = render(
      <ContactFilters
        data={data}
        loading={false}
        error={null}
        loadFilters={loadFilters}
      />,
    );

    expect(queryByTestId('FiltersList')).toBeVisible();
    expect(queryByTestId('LoadingText')).toBeNull();
    expect(queryByTestId('EmptyText')).toBeNull();
    expect(queryByTestId('ErrorText')).toBeNull();

    expect(queryByTestId('FiltersList').childNodes.length).toEqual(2);
  });

  it('loading', async () => {
    const { queryByTestId } = render(
      <ContactFilters
        data={data}
        loading={true}
        error={null}
        loadFilters={loadFilters}
      />,
    );

    expect(queryByTestId('FiltersList')).toBeNull();
    expect(queryByTestId('LoadingText')).toBeVisible();
    expect(queryByTestId('EmptyText')).toBeNull();
    expect(queryByTestId('ErrorText')).toBeNull();
  });

  it('empty', async () => {
    const { queryByTestId } = render(
      <ContactFilters
        data={undefined}
        loading={false}
        error={null}
        loadFilters={loadFilters}
      />,
    );

    expect(queryByTestId('FiltersList')).toBeNull();
    expect(queryByTestId('LoadingText')).toBeNull();
    expect(queryByTestId('EmptyText')).toBeVisible();
    expect(queryByTestId('ErrorText')).toBeNull();
  });
});
