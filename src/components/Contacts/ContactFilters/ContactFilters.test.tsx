import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactFilters } from './ContactFilters';
import { ContactFiltersQuery } from './ContactFilters.generated';
import {
  ContactFiltersDefaultMock,
  ContactFiltersEmptyMock,
  ContactFiltersErrorMock,
} from './ContactFilters.mocks';

const accountListId = '111';

describe('ContactFilters', () => {
  it('default', async () => {
    const { getByTestId, getByText, queryByTestId, queryAllByTestId } = render(
      <GqlMockedProvider<ContactFiltersQuery>
        mocks={{ ContactFilters: ContactFiltersDefaultMock }}
      >
        <ContactFilters
          accountListId={accountListId}
          onClose={() => {}}
          onSelectedFiltersChanged={() => {}}
        />
      </GqlMockedProvider>,
    );

    await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
    expect(queryByTestId('LoadingState')).toBeNull();
    expect(queryByTestId('ErrorState')).toBeNull();
    expect(queryAllByTestId('FilterGroup').length).toEqual(2);
    expect(getByTestId('FilterListItemShowAll')).toBeVisible();

    expect(getByText('See More Filters')).toBeVisible();

    userEvent.click(getByTestId('FilterListItemShowAll'));

    expect(getByText('See Fewer Filters')).toBeVisible();
    expect(
      getByText(
        ContactFiltersDefaultMock.accountList.contactFilterGroups[0].name,
      ),
    ).toBeVisible();
    expect(
      getByText(
        ContactFiltersDefaultMock.accountList.contactFilterGroups[1].name,
      ),
    ).toBeVisible();
  });

  it('no filters', async () => {
    const { queryByTestId, queryAllByTestId } = render(
      <GqlMockedProvider<ContactFiltersQuery>
        mocks={{ ContactFilters: ContactFiltersEmptyMock }}
      >
        <ContactFilters
          accountListId={accountListId}
          onClose={() => {}}
          onSelectedFiltersChanged={() => {}}
        />
      </GqlMockedProvider>,
    );

    await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
    expect(queryByTestId('LoadingState')).toBeNull();
    //expect(queryByTestId('ErrorState')).toBeNull();
    expect(queryAllByTestId('FilterGroup').length).toEqual(0);
    expect(queryByTestId('FilterListItemShowAll')).toBeNull();
  });

  it('loading indicator', async () => {
    const { getByTestId, queryByTestId, queryAllByTestId } = render(
      <GqlMockedProvider<ContactFiltersQuery>>
        <ContactFilters
          accountListId={accountListId}
          onClose={() => {}}
          onSelectedFiltersChanged={() => {}}
        />
      </GqlMockedProvider>,
    );

    expect(getByTestId('LoadingState')).toBeVisible();
    expect(queryByTestId('ErrorText')).toBeNull();
    expect(queryAllByTestId('FilterGroup').length).toEqual(0);
    expect(queryByTestId('FilterListItemShowAll')).toBeNull();
  });

  it('error loading filters', async () => {
    const { getByTestId, queryByTestId, queryAllByTestId } = render(
      <GqlMockedProvider<ContactFiltersQuery>
        mocks={{ ContactFilters: ContactFiltersErrorMock }}
      >
        <ContactFilters
          accountListId={accountListId}
          onClose={() => {}}
          onSelectedFiltersChanged={() => {}}
        />
      </GqlMockedProvider>,
    );

    await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
    expect(queryByTestId('LoadingState')).toBeNull();
    expect(getByTestId('ErrorState')).toBeVisible();
    expect(queryAllByTestId('FilterGroup').length).toEqual(0);
    expect(queryByTestId('FilterListItemShowAll')).toBeNull();
  });
});
