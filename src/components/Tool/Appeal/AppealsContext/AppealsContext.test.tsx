import { NextRouter } from 'next/router';
import React, { useContext } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactFiltersQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import { GetUserOptionsQuery } from 'src/components/Contacts/ContactFlow/GetUserOptions.generated';
import { parseSavedFilters } from 'src/components/Contacts/ContactsContext/ContactsContext';
import { ListHeaderCheckBoxState } from 'src/components/Shared/Header/ListHeader';
import { ContactFilterSetInput } from 'src/graphql/types.generated';
import { useMassSelection } from 'src/hooks/useMassSelection';
import theme from 'src/theme';
import {
  AppealStatusEnum,
  AppealTourEnum,
  AppealsContext,
  AppealsType,
  TableViewModeEnum,
} from './AppealsContext';

const accountListId = 'account-list-1';
const pathname =
  '/accountLists/[accountListId]/tools/appeals/appeal/[[...appealId]]';
const appealId = 'appeal-Id-1';
const contactId = '00000000-0000-0000-0000-000000000000';
const push = jest.fn();
const isReady = true;
const mutationSpy = jest.fn();
const deselectAll = jest.fn();
const toggleSelectAll = jest.fn();

jest.mock('src/hooks/useMassSelection');

(useMassSelection as jest.Mock).mockReturnValue({
  selectionType: ListHeaderCheckBoxState.Unchecked,
  isRowChecked: jest.fn(),
  toggleSelectAll,
  deselectAll,
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

interface AppealStatusFilterTestComponentProps {
  query?: NextRouter['query'];
}

const AppealStatusFilterTestComponent: React.FC<
  AppealStatusFilterTestComponentProps
> = ({ query }) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: {
          accountListId,
          ...query,
        },
        pathname:
          '/accountLists/[accountListId]/tools/appeals/appeal/[[...appealId]]',
        isReady,
        push,
      }}
    >
      <GqlMockedProvider onCall={mutationSpy}>
        <AppealsWrapper>
          <TestRender />
        </AppealsWrapper>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

const TestRender: React.FC = () => {
  const { viewMode, setViewMode, appealId } = useContext<ContactFilterSetInput>(
    AppealsContext,
  ) as AppealsType;
  return (
    <Box>
      {viewMode !== null ? (
        <>
          <Typography>appealId: {appealId}</Typography>
          <Typography>{viewMode}</Typography>
          <Button onClick={() => setViewMode(TableViewModeEnum.List)}>
            List Button
          </Button>
          <Button onClick={() => setViewMode(TableViewModeEnum.Flows)}>
            Flows Button
          </Button>
        </>
      ) : (
        <>Loading</>
      )}
    </Box>
  );
};

const TestRenderContactsFilters: React.FC = () => {
  const { filterData } = useContext(AppealsContext) as AppealsType;
  const savedFilters = parseSavedFilters(filterData, accountListId);

  return (
    <Box>
      {!!savedFilters.length && (
        <div data-testid="savedfilters-testid">{savedFilters[0]?.value}</div>
      )}
    </Box>
  );
};

describe('ContactsPageContext', () => {
  it('should switch views to flows', async () => {
    const { findByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: { accountListId, appealId: [appealId, 'list'] },
            pathname,
            isReady,
            push,
          }}
        >
          <GqlMockedProvider<{ GetUserOptions: GetUserOptionsQuery }>
            mocks={{
              GetUserOptions: {
                userOptions: [
                  {
                    id: 'test-id',
                    key: 'contacts_view',
                    value: 'flows',
                  },
                ],
              },
            }}
          >
            <AppealsWrapper>
              <TestRender />
            </AppealsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    userEvent.click(await findByText('Flows Button'));
    expect(await findByText('flows')).toBeInTheDocument();
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {
            accountListId,
            appealId: [appealId, 'flows'],
          },
        }),
        undefined,
        { shallow: true },
      ),
    );
  });

  it('should switch views to list', async () => {
    const { findByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: { accountListId, appealId: [appealId, 'flows'] },
            pathname,
            isReady,
            push,
          }}
        >
          <GqlMockedProvider<{ GetUserOptions: GetUserOptionsQuery }>
            mocks={{
              GetUserOptions: {
                userOptions: [
                  {
                    id: 'test-id',
                    key: 'contacts_view',
                    value: 'flows',
                  },
                ],
              },
            }}
          >
            <AppealsWrapper>
              <TestRender />
            </AppealsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    userEvent.click(await findByText('List Button'));
    expect(await findByText('list')).toBeInTheDocument();
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {
            accountListId,
            appealId: [appealId, 'list'],
          },
        }),
        undefined,
        { shallow: true },
      ),
    );
  });

  describe('activeFilters.appealStatus', () => {
    it('should default to showing asked contacts in list view', async () => {
      render(
        <AppealStatusFilterTestComponent
          query={{ appealId: [appealId, 'list', contactId] }}
        />,
      );

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('Contacts', {
          contactsFilters: { appealStatus: AppealStatusEnum.Asked },
        }),
      );
    });

    it('should not filter by appeal status in flows view', async () => {
      render(
        <AppealStatusFilterTestComponent
          query={{
            appealId: [appealId, 'flows', contactId],
          }}
        />,
      );

      await waitFor(() =>
        expect(mutationSpy).not.toHaveGraphqlOperation('Contacts', {
          contactsFilters: { appealStatus: AppealStatusEnum.Asked },
        }),
      );
    });
  });

  it('Saved filters with correct JSON', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: {
              accountListId,
              appealId: [appealId, 'flows', contactId],
            },
            pathname,
            isReady,
            push,
          }}
        >
          <GqlMockedProvider<{ ContactFilters: ContactFiltersQuery }>
            mocks={{
              ContactFilters: {
                userOptions: [
                  {
                    id: '123',
                    key: 'saved_contacts_filter_My_Cool_Filter',
                    value: `{"any_tags":false,"account_list_id":"${accountListId}","params":{"status": "true"},"tags":null,"exclude_tags":null,"wildcard_search":""}`,
                  },
                ],
              },
            }}
          >
            <AppealsWrapper>
              <TestRenderContactsFilters />
            </AppealsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('savedfilters-testid')).toBeInTheDocument(),
    );
  });

  it('Saved filters with incorrect JSON', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: { accountListId },
            pathname: '/accountLists/[accountListId]/contacts',
            isReady,
            push,
          }}
        >
          <GqlMockedProvider<{ ContactFilters: ContactFiltersQuery }>
            mocks={{
              ContactFilters: {
                userOptions: [
                  {
                    id: '123',
                    key: 'saved_contacts_filter_My_Cool_Filter',
                    value: `{"any_tags":false,"account_list_id":"${accountListId}","params":{"status" error },"tags":null,"exclude_tags":null,"wildcard_search":""}`,
                  },
                ],
              },
            }}
          >
            <AppealsWrapper>
              <TestRenderContactsFilters />
            </AppealsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('savedfilters-testid')).not.toBeInTheDocument(),
    );
  });

  describe('Appeal Tour', () => {
    const TourRender: React.FC = () => {
      const { tour, hideTour, nextTourStep } = useContext(
        AppealsContext,
      ) as AppealsType;

      if (!tour) {
        return <p>No Tour</p>;
      }
      return (
        <Box>
          <Typography>Tour step &quot;{tour}&quot;</Typography>
          <Button onClick={hideTour}>Hide</Button>
          <Button onClick={nextTourStep}>Next</Button>
        </Box>
      );
    };

    it('Should not load tour', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <TestRouter
            router={{
              query: { accountListId, appealId: [appealId, 'list'] },
              pathname:
                '/accountLists/[accountListId]/tools/appeals/[[...appealId]]',
              isReady,
            }}
          >
            <GqlMockedProvider>
              <AppealsWrapper>
                <TourRender />
              </AppealsWrapper>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>,
      );

      expect(getByText('No Tour')).toBeInTheDocument();
    });

    it('should start tour and step all through to the end of the tour', async () => {
      const { getByRole, getByText } = render(
        <ThemeProvider theme={theme}>
          <TestRouter
            router={{
              query: {
                accountListId,
                appealId: [appealId, 'list', 'tour'],
              },
              pathname:
                '/accountLists/[accountListId]/tools/appeals/[[...appealId]]',
              isReady,
            }}
          >
            <GqlMockedProvider>
              <AppealsWrapper>
                <TourRender />
              </AppealsWrapper>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>,
      );

      const hideTour = getByRole('button', { name: 'Hide' });
      const nextStep = getByRole('button', { name: 'Next' });

      expect(
        getByText(`Tour step "${AppealTourEnum.Start}"`),
      ).toBeInTheDocument();
      expect(hideTour).toBeInTheDocument();
      expect(nextStep).toBeInTheDocument();

      userEvent.click(nextStep);
      expect(
        getByText(`Tour step "${AppealTourEnum.ReviewExcluded}"`),
      ).toBeInTheDocument();

      userEvent.click(nextStep);
      expect(
        getByText(`Tour step "${AppealTourEnum.ReviewAsked}"`),
      ).toBeInTheDocument();

      userEvent.click(nextStep);
      expect(
        getByText(`Tour step "${AppealTourEnum.ExportContacts}"`),
      ).toBeInTheDocument();
      expect(deselectAll).toHaveBeenCalledTimes(1);
      expect(toggleSelectAll).toHaveBeenCalledTimes(1);

      userEvent.click(nextStep);
      expect(
        getByText(`Tour step "${AppealTourEnum.Finish}"`),
      ).toBeInTheDocument();

      userEvent.click(nextStep);
      expect(getByText('No Tour')).toBeInTheDocument();
    });
  });
});
