import { render } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import { GqlMockedProvider } from '../../../__tests__/util/graphqlMocking';
import TestRouter from '../../../__tests__/util/TestRouter';
import theme from '../../../src/theme';
import Contacts from './contacts.page';
import { ContactsQuery } from './Contacts.generated';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
};

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
  const name = 'Test Person';

  const { findAllByRole } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<ContactsQuery>
          mocks={{
            Contacts: {
              contacts: { nodes: [{ name }] },
            },
          }}
        >
          <Contacts />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );
  expect((await findAllByRole('row'))[0]).toHaveTextContent(name);
});

it('should render contact detail panel', async () => {
  const contactId = '1';

  const { findAllByRole } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<ContactsQuery>
          mocks={{
            Contacts: {
              contacts: { nodes: [{ id: contactId }] },
            },
          }}
        >
          <Contacts />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );

  const row = (await findAllByRole('rowButton'))[0];

  userEvent.click(row);

  const detailsTabList = (await findAllByRole('tablist'))[0];

  expect(detailsTabList).toBeInTheDocument();
});
