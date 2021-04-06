import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactFilters } from './ContactFilters';
import { ContactFiltersQuery } from './ContactFilters.generated';
import {
  ContactFiltersDefaultMock,
  ContactFiltersErrorMock,
} from './ContactFilters.mocks';

const accountListId = '111';

//TODO: Need test coverage for loading state and error state

describe('ContactFilters', () => {
  it('default', async () => {
    const { getByText, queryByTestId, queryAllByTestId } = render(
      <GqlMockedProvider<ContactFiltersQuery>
        mocks={{ ContactFilters: ContactFiltersDefaultMock }}
      >
        <ContactFilters accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
    expect(queryByTestId('LoadingState')).toBeNull();
    expect(queryByTestId('ErrorState')).toBeNull();
    expect(queryAllByTestId('FilterGroup').length).toEqual(2);

    expect(getByText('See More Filters')).toBeVisible();
    expect(getByText('Always Visible')).toBeVisible();
    expect(getByText('Hidden')).not.toBeVisible();

    userEvent.click(getByText('See More Filters'));

    expect(getByText('See Fewer Filters')).toBeVisible();
    expect(getByText('Always Visible')).toBeVisible();
    expect(getByText('Hidden')).toBeVisible();
  });

  it('loading indicator', async () => {
    const { getByTestId, queryByTestId, queryAllByTestId } = render(
      <GqlMockedProvider<ContactFiltersQuery>>
        <ContactFilters accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    expect(getByTestId('LoadingState')).toBeVisible();
    expect(queryByTestId('ErrorText')).toBeNull();
    expect(queryAllByTestId('FilterGroup').length).toEqual(0);
  });

  it('error loading filters', async () => {
    const { getByTestId, queryByTestId, queryAllByTestId } = render(
      <GqlMockedProvider<ContactFiltersQuery>
        mocks={{ ContactFilters: ContactFiltersErrorMock }}
      >
        <ContactFilters accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
    expect(queryByTestId('LoadingState')).toBeNull();
    expect(getByTestId('ErrorState')).toBeVisible();
    expect(queryAllByTestId('FilterGroup').length).toEqual(0);
  });
});
