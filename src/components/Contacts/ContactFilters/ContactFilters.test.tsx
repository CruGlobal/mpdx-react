import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactFiltersQuery } from '../../../../pages/accountLists/[accountListId]/ContactFilters.generated';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactFilters } from './ContactFilters';

const accountListId = '111';

describe('ContactFilters', () => {
  it('default', async () => {
    const { queryByTestId, queryByText } = render(
      <GqlMockedProvider<ContactFiltersQuery>>
        <ContactFilters accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    expect(queryByText('Loading Filters')).toBeNull();
    expect(queryByText('No Filters')).toBeVisible();
    expect(queryByTestId('ErrorText')).toBeNull();
    expect(queryByTestId('FiltersList')).toBeNull();
  });

  it('filters loaded', async () => {
    const { queryByTestId, queryByText } = render(
      <GqlMockedProvider<ContactFiltersQuery>>
        <ContactFilters accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    const loadFiltersButton = queryByText('Load Filters');

    userEvent.click(loadFiltersButton);

    await waitFor(() =>
      expect(queryByText('Loading Filters')).not.toBeInTheDocument(),
    );

    expect(queryByText('Loading Filters')).toBeNull();
    expect(queryByText('No Filters')).toBeNull();
    expect(queryByTestId('ErrorText')).toBeNull();
    expect(queryByTestId('FiltersList')).toBeVisible();

    expect(queryByTestId('FiltersList').childNodes.length).toEqual(2);
  });
});
