import React, { useMemo, useState } from 'react';
import { InMemoryCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactFiltersQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  GetAppealsDocument,
  GetAppealsQuery,
} from 'pages/accountLists/[accountListId]/tools/GetAppeals.generated';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { ListHeaderCheckBoxState } from 'src/components/Shared/Header/ListHeader';
import { AppealQuery } from 'src/components/Tool/Appeal/AppealDetails/AppealsMainPanel/AppealInfo.generated';
import { AppealsContactsQuery } from 'src/components/Tool/Appeal/AppealsContext/contacts.generated';
import {
  PledgeFrequencyEnum,
  SendNewsletterEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { useMassSelection } from 'src/hooks/useMassSelection';
import { createCache } from 'src/lib/apollo/cache';
import theme from 'src/theme';
import AppealsDetailsPage from './AppealsDetailsPage';

const accountListId = 'account-list-1';

const defaultRouter = {
  pathname:
    '/accountLists/[accountListId]/tools/appeals/appeal/[[...appealId]]',
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
  },
};

const appealsListUrl = `/accountLists/${accountListId}/tools/appeals`;
const notFoundMessage =
  'That appeal could not be found. It may have already been deleted.';

const throwAppealNotFound = () => {
  throw new GraphQLError('Appeal with id=1 not found', {
    extensions: { code: 'NOT_FOUND' },
  });
};

const appealRouter = (push: jest.Mock) => ({
  ...defaultRouter,
  query: { ...defaultRouter.query, appealId: ['1', 'list'] },
  push,
});

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

const Components = ({
  router = defaultRouter,
  mocks,
  cache: initialCache,
}: {
  router?: object;
  mocks?: ApolloErgonoMockMap;
  cache?: InMemoryCache;
}) => {
  const [cache] = useState(() => initialCache ?? createCache());
  const providerMocks = useMemo(
    () => ({
      AppealsContacts: mockResponse,
      Appeal: mockAppealResponse,
      ContactFilters: {
        userOptions: [],
      },
      ...mocks,
    }),
    [mocks],
  );

  return (
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <DndProvider backend={HTML5Backend}>
          <GqlMockedProvider<{
            AppealsContacts: AppealsContactsQuery;
            Appeal: AppealQuery;
            ContactFilters: ContactFiltersQuery;
          }>
            mocks={providerMocks}
            cache={cache}
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
};

describe('AppealsDetailsPage', () => {
  describe('Contact drawer', () => {
    it('should be a link with the correct href', async () => {
      const { findByTestId, findByText, queryByRole } = render(
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

      expect(contactRow).toHaveAttribute(
        'href',
        '/accountLists/account-list-1/tools/appeals/appeal/1/list/1',
      );
    });

    it('should be a link on the Flows view', async () => {
      const { getAllByText, queryByRole } = render(
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

      const contactName = getAllByText('Test Person')[0];

      expect(contactName).toHaveAttribute(
        'href',
        '/accountLists/account-list-1/tools/appeals/appeal/1/flows/1',
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

      userEvent.click(await findByRole('img', { name: 'Close' }));

      await waitFor(() =>
        expect(
          queryByRole('heading', { name: /export to csv/i }),
        ).not.toBeInTheDocument(),
      );

      userEvent.click(getByRole('img', { name: /toggle filter panel/i }));

      expect(
        await findByRole('heading', { name: /export to csv/i }),
      ).toBeInTheDocument();
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
        queryByRole('complementary', { name: 'Filter' }),
      ).not.toBeInTheDocument();

      userEvent.click(getByRole('img', { name: /toggle filter panel/i }));

      expect(
        await findByRole('complementary', { name: 'Filter' }),
      ).toBeInTheDocument();

      userEvent.click(getByRole('img', { name: 'Close' }));

      await waitFor(() =>
        expect(
          queryByRole('complementary', { name: 'Filter' }),
        ).not.toBeInTheDocument(),
      );
    });
  });

  describe('Appeal not found', () => {
    it('redirects to the appeals list and removes the appeal from it', async () => {
      const cache = createCache();
      cache.writeQuery<GetAppealsQuery>({
        query: GetAppealsDocument,
        variables: { accountListId },
        data: {
          primaryAppeal: { nodes: [], totalCount: 0 },
          regularAppeals: {
            nodes: [
              { __typename: 'Appeal', ...mockAppealResponse.appeal, id: '1' },
            ],
            totalCount: 1,
            pageInfo: { endCursor: null, hasNextPage: false },
          },
        },
      });
      const routerPush = jest.fn();

      render(
        <Components
          cache={cache}
          router={appealRouter(routerPush)}
          mocks={{ Appeal: { appeal: throwAppealNotFound } }}
        />,
      );

      await waitFor(() =>
        expect(routerPush).toHaveBeenCalledWith(appealsListUrl),
      );
      expect(mockEnqueue).toHaveBeenCalledWith(notFoundMessage, {
        variant: 'error',
      });
      const appeals = cache.readQuery<GetAppealsQuery>({
        query: GetAppealsDocument,
        variables: { accountListId },
      });
      expect(appeals?.regularAppeals.nodes).toEqual([]);
    });

    it('redirects again when another navigation cancels the redirect', async () => {
      const routerPush = jest.fn();
      const router = {
        ...defaultRouter,
        query: { ...defaultRouter.query, appealId: ['1'] },
        asPath: `/accountLists/${accountListId}/tools/appeals/appeal/1`,
        push: routerPush,
      };
      const appealMock = jest.fn(throwAppealNotFound);
      const mocks = { Appeal: { appeal: appealMock } };
      const redirects = () =>
        routerPush.mock.calls.filter(([url]) => url === appealsListUrl);

      const { rerender } = render(<Components router={router} mocks={mocks} />);

      await waitFor(() => expect(redirects()).toHaveLength(1));

      rerender(
        <Components
          router={{
            ...router,
            query: { ...router.query, appealId: ['1', 'list'] },
            asPath: `/accountLists/${accountListId}/tools/appeals/appeal/1/list`,
          }}
          mocks={mocks}
        />,
      );

      await waitFor(() => expect(redirects()).toHaveLength(2));
      expect(appealMock).toHaveBeenCalledTimes(1);
      expect(mockEnqueue).toHaveBeenCalledTimes(1);
    });

    it('stays on the appeal page when the appeal fails to load for another reason', async () => {
      const routerPush = jest.fn();

      const { findByText } = render(
        <Components
          router={appealRouter(routerPush)}
          mocks={{
            Appeal: {
              appeal: () => {
                throw new GraphQLError('Internal server error', {
                  extensions: { code: 'INTERNAL_SERVER_ERROR' },
                });
              },
            },
          }}
        />,
      );

      expect(await findByText('Test Person')).toBeInTheDocument();
      expect(routerPush).not.toHaveBeenCalled();
      expect(mockEnqueue).not.toHaveBeenCalledWith(
        notFoundMessage,
        expect.anything(),
      );
    });
  });

  describe('Delete appeal', () => {
    it('does not report the deleted appeal as not found while leaving the page', async () => {
      const appealMock = jest
        .fn()
        .mockReturnValueOnce({ ...mockAppealResponse.appeal, id: '1' })
        .mockImplementation(throwAppealNotFound);
      let unmountPage = () => {};
      const routerPush = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        unmountPage();
        return true;
      });

      const { findByText, unmount } = render(
        <Components
          router={appealRouter(routerPush)}
          mocks={{
            Appeal: { appeal: appealMock },
            DeleteAppeal: { deleteAppeal: { id: '1' } },
          }}
        />,
      );
      unmountPage = unmount;

      userEvent.click(await findByText('Permanently Delete Appeal'));
      userEvent.click(
        await findByText('Delete Appeal', { selector: 'button' }),
      );

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Successfully deleted appeal.',
          { variant: 'success' },
        ),
      );
      await waitFor(() => expect(routerPush).toHaveBeenCalledTimes(1));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(routerPush).toHaveBeenCalledTimes(1);
      expect(appealMock).toHaveBeenCalledTimes(1);
      expect(mockEnqueue).not.toHaveBeenCalledWith(
        notFoundMessage,
        expect.anything(),
      );
    });
  });
});
