import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ListHeaderCheckBoxState } from 'src/components/Shared/Header/ListHeader';
import { AppealQuery } from 'src/components/Tool/Appeal/AppealDetails/AppealsMainPanel/AppealInfo.generated';
import { ContactsQuery } from 'src/components/Tool/Appeal/AppealsContext/contacts.generated';
import {
  PledgeFrequencyEnum,
  SendNewsletterEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { useMassSelection } from 'src/hooks/useMassSelection';
import theme from 'src/theme';
import Appeal from './[[...appealId]].page';

const accountListId = 'account-list-1';

const defaultRouter = {
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

const mockAppealResponse = {
  appeal: {
    amount: 4531,
    amountCurrency: 'USD',
    id: '9d660aed-1291-4c5b-874d-409a94b5ed3b',
    name: 'End Of Year Gift',
    pledgesAmountNotReceivedNotProcessed: 2000,
    pledgesAmountProcessed: 50,
    pledgesAmountReceivedNotProcessed: 50,
    pledgesAmountTotal: 2115.93,
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

const Components = ({ router = defaultRouter }: { router?: object }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <DndProvider backend={HTML5Backend}>
        <GqlMockedProvider<{ Contacts: ContactsQuery; Appeal: AppealQuery }>
          mocks={{
            Contacts: mockResponse,
            Appeal: mockAppealResponse,
          }}
        >
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 1000, itemHeight: 100 }}
          >
            <Appeal />
          </VirtuosoMockContext.Provider>
        </GqlMockedProvider>
      </DndProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('Appeal navigation', () => {
  it('should show list detail appeal page and close filters', async () => {
    const { getByText, findByTestId, queryByText, getByRole, queryByRole } =
      render(
        <Components
          router={{
            ...defaultRouter,
            query: {
              ...defaultRouter.query,
              appealId: ['1', 'list'],
            },
          }}
        />,
      );

    await waitFor(() => {
      expect(queryByText('Primary Appeal')).not.toBeInTheDocument();
      expect(queryByText('Add Appeal')).not.toBeInTheDocument();
    });

    await waitFor(() => expect(getByText('Test Person')).toBeInTheDocument());
    expect(await findByTestId('rowButton')).toHaveTextContent(contact.name);

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Given' })).toBeInTheDocument();
      expect(getByRole('heading', { name: 'Received' })).toBeInTheDocument();
      expect(getByRole('heading', { name: 'Committed' })).toBeInTheDocument();

      expect(
        getByRole('heading', { name: 'Export to CSV' }),
      ).toBeInTheDocument();
      expect(
        getByRole('heading', { name: 'Export Emails' }),
      ).toBeInTheDocument();
    });

    userEvent.click(getByRole('img', { name: 'Toggle Filter Panel' }));

    await waitFor(() => {
      expect(queryByRole('heading', { name: 'Given' })).not.toBeInTheDocument();
      expect(
        queryByRole('heading', { name: 'Received' }),
      ).not.toBeInTheDocument();
      expect(
        queryByRole('heading', { name: 'Committed' }),
      ).not.toBeInTheDocument();
    });
  });

  it('should show flows detail appeal page and open filters', async () => {
    const { queryByText, getByRole } = render(
      <Components
        router={{
          ...defaultRouter,
          query: {
            ...defaultRouter.query,
            appealId: ['1', 'flows'],
          },
        }}
      />,
    );

    await waitFor(() => {
      expect(queryByText('Primary Appeal')).not.toBeInTheDocument();
      expect(queryByText('Add Appeal')).not.toBeInTheDocument();
    });

    await waitFor(() =>
      expect(getByRole('heading', { name: 'Excluded' })).toBeInTheDocument(),
    );

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Excluded' })).toBeInTheDocument();
      expect(getByRole('heading', { name: 'Asked' })).toBeInTheDocument();
      expect(getByRole('heading', { name: 'Committed' })).toBeInTheDocument();
      expect(getByRole('heading', { name: 'Received‌⁠' })).toBeInTheDocument();
      expect(getByRole('heading', { name: 'Given' })).toBeInTheDocument();
    });

    userEvent.click(getByRole('img', { name: 'Toggle Filter Panel' }));

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Filter' })).toBeInTheDocument();
      expect(
        getByRole('heading', { name: 'See More Filters' }),
      ).toBeInTheDocument();
    });
  });
});
