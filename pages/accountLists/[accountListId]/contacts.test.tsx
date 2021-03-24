import { render } from '@testing-library/react';
import React from 'react';
import { GqlMockedProvider } from '../../../__tests__/util/graphqlMocking';
import TestRouter from '../../../__tests__/util/TestRouter';
import Contacts from './contacts.page';
import { ContactsQuery } from './Contacts.generated';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
};

it('should show loading state', () => {
  const { getByText } = render(
    <TestRouter router={router}>
      <GqlMockedProvider>
        <Contacts />
      </GqlMockedProvider>
    </TestRouter>,
  );
  expect(getByText('Loading')).toBeInTheDocument();
});
it('should render list of people', async () => {
  const name = 'Test Person';

  const { findAllByRole } = render(
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
    </TestRouter>,
  );
  expect((await findAllByRole('row'))[0]).toHaveTextContent(name);
});
