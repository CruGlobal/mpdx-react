import React from 'react';
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

//TODO: Need test coverage for error state

describe('ContactFilters', () => {
  it('loading', async () => {
    const { queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactsQuery>>
          <ContactsTable
            accountListId={accountListId}
            onContactSelected={onContactSelected}
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
    const { getByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactsQuery>>
          <ContactsTable
            accountListId={accountListId}
            onContactSelected={onContactSelected}
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
    expect(getByTestId('ContactRows').childNodes.length).toEqual(3);
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
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactsQuery> mocks={mocks}>
          <ContactsTable
            accountListId={accountListId}
            onContactSelected={onContactSelected}
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
          nodes: [{ id: contactId }],
        },
      },
    };

    const { findByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactsQuery> mocks={mocks}>
          <ContactsTable
            accountListId={accountListId}
            onContactSelected={onContactSelected}
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
});
