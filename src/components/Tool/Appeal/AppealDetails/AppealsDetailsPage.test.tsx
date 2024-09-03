import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
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
import AppealsDetailsPage from './AppealsDetailsPage';

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
            <AppealsWrapper>
              <AppealsDetailsPage />
            </AppealsWrapper>
          </VirtuosoMockContext.Provider>
        </GqlMockedProvider>
      </DndProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('AppealsDetailsPage', () => {
  describe('Contact drawer', () => {
    it('should open and close on List view', async () => {
      const {
        findByTestId,
        findByText,
        findByRole,
        getAllByRole,
        queryByRole,
      } = render(
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

      expect(await findByText('Test Person')).toBeInTheDocument();

      expect(queryByRole('tab', { name: 'Tasks' })).not.toBeInTheDocument();

      const contactRow = await findByTestId('rowButton');
      userEvent.click(contactRow);

      expect(await findByRole('tab', { name: 'Tasks' })).toBeInTheDocument(),
        userEvent.click(getAllByRole('img', { name: 'Close' })[0]);

      await waitFor(() =>
        expect(queryByRole('tab', { name: 'Tasks' })).not.toBeInTheDocument(),
      );
    });

    it('should open and close on Flows view', async () => {
      const { getAllByText, getByRole, findByRole, queryByRole } = render(
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

      await waitFor(() => expect(getAllByText('Test Person').length).toBe(5));

      expect(queryByRole('tab', { name: 'Tasks' })).not.toBeInTheDocument();

      userEvent.click(getAllByText('Test Person')[0]);

      expect(await findByRole('tab', { name: 'Tasks' })).toBeInTheDocument();
      userEvent.click(getByRole('img', { name: 'Close' }));

      await waitFor(() =>
        expect(queryByRole('tab', { name: 'Tasks' })).not.toBeInTheDocument(),
      );
    });
  });

  describe('Filters', () => {
    it('should open and close on List view', async () => {
      const { getByRole, findByRole, queryByRole } = render(
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

      expect(
        await findByRole('img', { name: /toggle filter panel/i }),
      ).toBeInTheDocument();

      expect(
        queryByRole('heading', { name: /export to csv/i }),
      ).not.toBeInTheDocument();

      userEvent.click(getByRole('img', { name: /toggle filter panel/i }));

      expect(
        await findByRole('heading', { name: /export to csv/i }),
      ).toBeInTheDocument();

      userEvent.click(getByRole('img', { name: 'Close' }));

      await waitFor(() =>
        expect(
          queryByRole('heading', { name: /export to csv/i }),
        ).not.toBeInTheDocument(),
      );
    });

    it('should open and close on Flows view', async () => {
      const { getByRole, findByRole, queryByRole } = render(
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

      expect(
        await findByRole('img', { name: /toggle filter panel/i }),
      ).toBeInTheDocument();

      expect(
        queryByRole('heading', { name: /see more filters/i }),
      ).not.toBeInTheDocument();

      userEvent.click(getByRole('img', { name: /toggle filter panel/i }));

      expect(
        await findByRole('heading', { name: /see more filters/i }),
      ).toBeInTheDocument();

      userEvent.click(getByRole('img', { name: 'Close' }));

      await waitFor(() =>
        expect(
          queryByRole('heading', { name: /see more filters/i }),
        ).not.toBeInTheDocument(),
      );
    });
  });
});
