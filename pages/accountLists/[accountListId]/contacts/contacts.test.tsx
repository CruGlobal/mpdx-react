import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { ListHeaderCheckBoxState } from 'src/components/Shared/Header/ListHeader';
import {
  PledgeFrequencyEnum,
  SendNewsletterEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { useMassSelection } from 'src/hooks/useMassSelection';
import theme from 'src/theme';
import { ContactsQuery } from './Contacts.generated';
import * as ContactsPageModule from './[[...contactId]].page';

const Contacts = ContactsPageModule.default;
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

// getServerSideProps would make client navigation here fetch /_next/data,
// which fails offline
it('should not have getServerSideProps', () => {
  expect(ContactsPageModule).not.toHaveProperty('getServerSideProps');
});

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

it('should close the filters from the backdrop on small screens without saving', async () => {
  matchMediaMock({ width: '390px' });
  const mutationSpy = jest.fn();
  const { findByRole, getByTestId } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<{ Contacts: ContactsQuery }>
          mocks={{
            Contacts: mockResponse,
          }}
          onCall={mutationSpy}
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

  userEvent.click(await findByRole('img', { name: 'Toggle Filter Panel' }));
  const leftPanel = getByTestId('SidePanelsLayoutLeftPanel');
  expect(leftPanel).toHaveStyle('transform: none');

  userEvent.click(getByTestId('SidePanelsLayoutBackdrop'));
  expect(leftPanel).toHaveStyle('transform: translate(-100%)');
  expect(mutationSpy).not.toHaveGraphqlOperation('UpdateUserOption');
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
