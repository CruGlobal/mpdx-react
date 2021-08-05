import React, { ReactElement } from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import TestRouter from '../../../../__tests__/util/TestRouter';
import theme from '../../../../src/theme';
import Contacts from './[[...contactId]].page';
import { ContactsQuery } from './Contacts.generated';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

const contact = { id: '1', name: 'Test Person' };

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

it('should show loading state', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider>
          <Contacts />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );
  expect(getByText('Loading')).toBeInTheDocument();
});

it('should render list of people', async () => {
  const { findByTestId, getByText } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<ContactsQuery>
          mocks={{
            Contacts: {
              contacts: {
                nodes: [contact],
                pageInfo: { endCursor: 'Mg', hasNextPage: false },
              },
            },
          }}
        >
          <Contacts />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );
  await waitFor(() => expect(getByText('Test Person')).toBeInTheDocument());
  expect(await findByTestId('rowButton')).toHaveTextContent(contact.name);
});

it('should render contact detail panel', async () => {
  const { findByTestId, findAllByRole, getByText } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<ContactsQuery>
          mocks={{
            Contacts: {
              contacts: {
                nodes: [contact],
                pageInfo: { endCursor: 'Mg', hasNextPage: false },
              },
            },
          }}
        >
          <Contacts />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );
  await waitFor(() => expect(getByText('Test Person')).toBeInTheDocument());
  const row = await findByTestId('rowButton');

  userEvent.click(row);

  const detailsTabList = (await findAllByRole('tablist'))[0];

  expect(detailsTabList).toBeInTheDocument();
});
