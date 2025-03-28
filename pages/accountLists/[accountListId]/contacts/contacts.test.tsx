import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ListHeaderCheckBoxState } from 'src/components/Shared/Header/ListHeader';
import {
  PledgeFrequencyEnum,
  SendNewsletterEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { useMassSelection } from 'src/hooks/useMassSelection';
import theme from 'src/theme';
import { ContactsQuery } from './Contacts.generated';
import Contacts from './[[...contactId]].page';

const accountListId = 'account-list-1';

const router = {
  pathname: '/accountLists/[accountListId]/contacts/[contactId]',
  query: { accountListId },
  isReady: true,
};

const contact = {
  id: '1',
  name: 'Test Person',
  avatar: 'img.png',
  primaryAddress: null,
  status: StatusEnum.PartnerFinancial,
  pledgeAmount: 100,
  pledgeFrequency: PledgeFrequencyEnum.Monthly,
  pledgeCurrency: 'USD',
  pledgeReceived: true,
  lateAt: new Date().toISOString(),
  sendNewsletter: SendNewsletterEnum.Both,
  starred: false,
  uncompletedTasksCount: 0,
  people: { nodes: [] },
};

const mockResponse = {
  contacts: {
    nodes: [contact],
    totalCount: 1,
    pageInfo: { endCursor: 'Mg', hasNextPage: false },
  },
  allContacts: {
    totalCount: 1,
  },
};

jest.mock('src/hooks/useMassSelection');

(useMassSelection as jest.Mock).mockReturnValue({
  ids: [],
  selectionType: ListHeaderCheckBoxState.Unchecked,
  isRowChecked: jest.fn(),
  toggleSelectAll: jest.fn(),
  toggleSelectionById: jest.fn(),
});

const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

it('should render list of people', async () => {
  const { findByTestId, getByText } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<{ Contacts: ContactsQuery }>
          mocks={{
            Contacts: mockResponse,
          }}
        >
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 1000, itemHeight: 100 }}
          >
            <Contacts />
          </VirtuosoMockContext.Provider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );

  await waitFor(() => expect(getByText('Test Person')).toBeInTheDocument());
  expect(await findByTestId('rowButton')).toHaveTextContent(contact.name);
});

it('should render contact link correctly', async () => {
  const { findByRole } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<{ Contacts: ContactsQuery }>
          mocks={{
            Contacts: mockResponse,
          }}
        >
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 1000, itemHeight: 100 }}
          >
            <Contacts />
          </VirtuosoMockContext.Provider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );

  const contactLink = await findByRole('link', { name: /test Person/i });

  expect(contactLink).toHaveAttribute(
    'href',
    '/accountLists/account-list-1/contacts/1',
  );
});
