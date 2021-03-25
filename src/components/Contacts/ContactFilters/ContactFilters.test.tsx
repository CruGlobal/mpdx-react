import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactFilters } from './ContactFilters';
import { ContactFiltersQuery } from './ContactFilters.generated';

const accountListId = '111';

//TODO: Need test coverage for loading state and error state

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
    const { getByText, queryByTestId, queryByText, getByTestId } = render(
      <GqlMockedProvider<ContactFiltersQuery>>
        <ContactFilters accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    const loadFiltersButton = getByText('Load Filters');

    userEvent.click(loadFiltersButton);

    await waitFor(() =>
      expect(queryByText('Loading Filters')).not.toBeInTheDocument(),
    );

    expect(queryByText('Loading Filters')).toBeNull();
    expect(queryByText('No Filters')).toBeNull();
    expect(queryByTestId('ErrorText')).toBeNull();
    expect(queryByTestId('FiltersList')).toBeVisible();

    expect(getByTestId('FiltersList').childNodes.length).toEqual(2);
  });
});
