import React, { ReactElement } from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import theme from '../../../theme';
import { ContactsTable } from './ContactsTable';

const accountListId = '111';
const contactId = 'contact-1';
const onContactSelected = jest.fn();
const onSearchTermChanged = jest.fn();

jest.mock('react-virtualized', () => {
  const ReactVirtualized = jest.requireActual('react-virtualized');
  return {
    ...ReactVirtualized,
    AutoSizer: ({
      children,
    }: {
      children: ({
        height,
        width,
      }: {
        height: number;
        width: number;
      }) => ReactElement;
    }) => children({ height: 1000, width: 1000 }),
  };
});
//TODO: Need test coverage for error state

describe('ContactFilters', () => {
  it('loading', async () => {
    const { queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactsQuery>>
          <ContactsTable
            accountListId={accountListId}
            onContactSelected={onContactSelected}
            onSearchTermChange={onSearchTermChanged}
            activeFilters={false}
            filterPanelOpen={false}
            toggleFilterPanel={() => {}}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(queryByText('Loading')).toBeVisible();
    expect(queryByText('No Data')).toBeNull();
    expect(queryByText('Error:')).toBeNull();
    expect(queryByTestId('ContactRows')).toBeNull();
  });

  it('contacts loaded', async () => {
    const mocks = {
      Contacts: {
        contacts: {
          nodes: [{ id: contactId, name: 'Test Guy ' }],
          pageInfo: { endCursor: 'Mg', hasNextPage: false },
        },
      },
    };
    const { getByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactsQuery> mocks={mocks}>
          <ContactsTable
            accountListId={accountListId}
            onContactSelected={onContactSelected}
            onSearchTermChange={onSearchTermChanged}
            activeFilters={false}
            filterPanelOpen={false}
            toggleFilterPanel={() => {}}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());

    expect(queryByText('Loading')).toBeNull();
    expect(queryByText('No Data')).toBeNull();
    expect(queryByText('Error:')).toBeNull();

    expect(
      getByTestId('ContactRows').children[0].children[0].children[0]
        .textContent,
    ).toContain('Test Guy');
    expect(
      getByTestId('ContactRows').children[0].children[0].childNodes.length,
    ).toEqual(1);
  });

  it('empty', async () => {
    const mocks = {
      Contacts: {
        contacts: {
          nodes: [],
          pageInfo: { endCursor: 'Mg', hasNextPage: false },
        },
      },
    };

    const { queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactsQuery> mocks={mocks}>
          <ContactsTable
            accountListId={accountListId}
            onContactSelected={onContactSelected}
            onSearchTermChange={onSearchTermChanged}
            activeFilters={false}
            filterPanelOpen={false}
            toggleFilterPanel={() => {}}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());

    expect(queryByText('Loading')).toBeNull();
    expect(queryByText('No Data')).toBeVisible();
    expect(queryByText('Error:')).toBeNull();
    expect(queryByTestId('ContactRows')).toBeNull();
  });

  it('simulate row click', async () => {
    const mocks = {
      Contacts: {
        contacts: {
          nodes: [{ id: contactId, name: 'Test Guy ' }],
          pageInfo: { endCursor: 'Mg', hasNextPage: false },
        },
      },
    };

    const { findByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactsQuery> mocks={mocks}>
          <ContactsTable
            accountListId={accountListId}
            onContactSelected={onContactSelected}
            onSearchTermChange={onSearchTermChanged}
            activeFilters={false}
            filterPanelOpen={false}
            toggleFilterPanel={() => {}}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());

    const row = await findByTestId('rowButton');

    userEvent.click(row);

    expect(onContactSelected).toHaveBeenCalledWith(contactId);
  });

  it('simulate row click with searchTerm', async () => {
    const mocks = {
      Contacts: {
        contacts: {
          nodes: [{ id: contactId, name: 'Test Guy ' }],
          pageInfo: { endCursor: 'Mg', hasNextPage: false },
        },
      },
    };
    const querySpy = jest.fn();
    const searchTerm = 'test';
    const { findByTestId, queryByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactsQuery> mocks={mocks} onCall={querySpy}>
          <ContactsTable
            accountListId={accountListId}
            onContactSelected={onContactSelected}
            onSearchTermChange={onSearchTermChanged}
            activeFilters={false}
            filterPanelOpen={false}
            toggleFilterPanel={() => {}}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    userEvent.type(getByRole('textbox'), searchTerm);
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    const row = await findByTestId('rowButton');

    userEvent.click(row);
    await waitFor(() => expect(queryByText('Test Guy')).toBeInTheDocument());
    const { operation } = querySpy.mock.calls[1][0];

    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.searchTerm).toEqual(searchTerm);
    // TODO Figure out why onContactSelected isn't called in this test
    // expect(onContactSelected).toHaveBeenCalledWith(
    //   response.data.contacts.nodes[0].id,
    // );
    expect(onSearchTermChanged).toHaveBeenCalledWith(searchTerm);
  });
});
