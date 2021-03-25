import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactsQuery } from '../../../../pages/accountLists/[accountListId]/Contacts.generated';
import { ContactsTable } from './ContactsTable';

const accountListId = '111';

//TODO: Need test coverage for error state

describe('ContactFilters', () => {
  it('loading', async () => {
    const { queryByTestId, queryByText } = render(
      <GqlMockedProvider<ContactsQuery>>
        <ContactsTable accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    expect(queryByText('Loading')).toBeVisible();
    expect(queryByText('No Data')).toBeNull();
    expect(queryByText('Error:')).toBeNull();
    expect(queryByTestId('ContactRows')).toBeNull();
  });

  it('contacts loaded', async () => {
    const { queryByTestId, queryByText } = render(
      <GqlMockedProvider<ContactsQuery>>
        <ContactsTable accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());

    expect(queryByText('Loading')).toBeNull();
    expect(queryByText('No Data')).toBeNull();
    expect(queryByText('Error:')).toBeNull();
    expect(queryByTestId('ContactRows').childNodes.length).toEqual(3);
  });

  it('empty', async () => {
    const mocks = {
      Contacts: {
        contacts: {
          nodes: [],
        },
      },
    };

    const { queryByTestId, queryByText } = render(
      <GqlMockedProvider<ContactsQuery> mocks={mocks}>
        <ContactsTable accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());

    expect(queryByText('Loading')).toBeNull();
    expect(queryByText('No Data')).toBeVisible();
    expect(queryByText('Error:')).toBeNull();
    expect(queryByTestId('ContactRows')).toBeNull();
  });
});
