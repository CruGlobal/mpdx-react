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
import { ContactsContextSavedFilters as AppealsContextSavedFilters } from 'src/components/Contacts/ContactsContext/ContactsContext';
import {
  ListHeaderCheckBoxState,
  TableViewModeEnum,
} from 'src/components/Shared/Header/ListHeader';
import { useMassSelection } from 'src/hooks/useMassSelection';
import theme from 'src/theme';
import { AppealTourEnum, AppealsContext, AppealsType } from './AppealsContext';

const accountListId = 'account-list-1';
const appealIdentifier = 'appeal-Id-1';
const contactId = 'contact-id';
const push = jest.fn();
const isReady = true;
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

const TestRender: React.FC = () => {
  const {
    viewMode,
    handleViewModeChange,
    userOptionsLoading,
    appealId,
    contactDetailsId,
    setContactFocus,
  } = useContext(AppealsContext) as AppealsType;
  return (
    <Box>
      {!userOptionsLoading ? (
        <>
          <Typography>appealId: {appealId}</Typography>
          <Typography>contactDetailsId: {contactDetailsId}</Typography>
          <Typography>{viewMode}</Typography>
          <Button
            onClick={(event) =>
              handleViewModeChange(event, TableViewModeEnum.List)
            }
          >
            List Button
          </Button>
          <Button
            onClick={(event) =>
              handleViewModeChange(event, TableViewModeEnum.Flows)
            }
          >
            Flows Button
          </Button>

          <Button onClick={() => setContactFocus(contactId, true)}>
            Open Contact
          </Button>

          <Button onClick={() => setContactFocus(undefined, false)}>
            Close Contact
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
  const savedFilters = AppealsContextSavedFilters(filterData, accountListId);

  return (
    <Box>
      {!!savedFilters.length && (
        <div data-testid="savedfilters-testid">{savedFilters[0]?.value}</div>
      )}
    </Box>
  );
};

describe('ContactsPageContext', () => {
  beforeEach(() => {
    deselectAll.mockClear();
    toggleSelectAll.mockClear();
  });
  it('should open a contact and the URL should reflect the opened contact', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: { accountListId, appealId: [appealIdentifier, 'flows'] },
            pathname:
              '/accountLists/[accountListId]/tools/appeals/[[...contactId]]',
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

    expect(getByText('Loading')).toBeInTheDocument();
    await waitFor(() =>
      expect(getByText(`appealId: ${appealIdentifier}`)).toBeInTheDocument(),
    );
    userEvent.click(getByText('Open Contact'));
    await waitFor(() =>
      expect(getByText(`contactDetailsId: ${contactId}`)).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith({
        pathname:
          '/accountLists/account-list-1/tools/appeals/appeal-Id-1/flows/contact-id',
        query: {},
      }),
    );
  });

  it('should switch views to flows and back to list', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: { accountListId, appealId: [appealIdentifier, 'list'] },
            pathname:
              '/accountLists/[accountListId]/tools/appeals/[[...contactId]]',
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
    await waitFor(() => expect(getByText('Flows Button')).toBeInTheDocument());
    userEvent.click(getByText('Flows Button'));
    await waitFor(() => expect(getByText('flows')).toBeInTheDocument());
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith({
        pathname:
          '/accountLists/account-list-1/tools/appeals/appeal-Id-1/flows',
        query: {},
      }),
    );

    userEvent.click(getByText('List Button'));
    await waitFor(() => expect(getByText('list')).toBeInTheDocument());
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith({
        pathname: '/accountLists/account-list-1/tools/appeals/appeal-Id-1/list',
        query: {},
      }),
    );
  });

  it('should redirect back to flows view on contact page', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: {
              accountListId,
              appealId: [appealIdentifier, 'flows', contactId],
            },
            pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
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
    expect(getByText('Loading')).toBeInTheDocument();
    await waitFor(() =>
      expect(getByText(`contactDetailsId: ${contactId}`)).toBeInTheDocument(),
    );

    await waitFor(() => expect(getByText('Close Contact')).toBeInTheDocument());
    userEvent.click(getByText('Close Contact'));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith({
        pathname:
          '/accountLists/account-list-1/tools/appeals/appeal-Id-1/flows',
        query: {},
      }),
    );
  });

  it('Saved filters with correct JSON', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: {
              accountListId,
              appealId: [appealIdentifier, 'flows', contactId],
            },
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
              query: { accountListId, appealId: [appealIdentifier, 'list'] },
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
                appealId: [appealIdentifier, 'list', 'tour'],
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
