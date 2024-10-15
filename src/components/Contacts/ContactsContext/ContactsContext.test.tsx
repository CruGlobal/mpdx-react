import React, { useContext } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactFiltersQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { GetUserOptionsQuery } from 'src/components/Contacts/ContactFlow/GetUserOptions.generated';
import { useMassSelection } from '../../../hooks/useMassSelection';
import theme from '../../../theme';
import {
  ListHeaderCheckBoxState,
  TableViewModeEnum,
} from '../../Shared/Header/ListHeader';
import {
  ContactsContext,
  ContactsContextSavedFilters,
  ContactsType,
} from './ContactsContext';

const accountListId = 'account-list-1';
const isReady = true;
const replace = jest.fn();

jest.mock('src/hooks/useMassSelection');

(useMassSelection as jest.Mock).mockReturnValue({
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

const TestRender: React.FC = () => {
  const { viewMode, handleViewModeChange, userOptionsLoading } = useContext(
    ContactsContext,
  ) as ContactsType;
  return (
    <Box>
      {!userOptionsLoading ? (
        <>
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
          <Button
            onClick={(event) =>
              handleViewModeChange(event, TableViewModeEnum.Map)
            }
          >
            Map Button
          </Button>
        </>
      ) : (
        <>Loading</>
      )}
    </Box>
  );
};

const TestRenderContactsFilters: React.FC = () => {
  const { filterData } = useContext(ContactsContext) as ContactsType;
  const savedFilters = ContactsContextSavedFilters(filterData, accountListId);
  return (
    <Box>
      {savedFilters.length && (
        <div data-testid="savedfilters-testid">{savedFilters[0]?.value}</div>
      )}
    </Box>
  );
};

describe('ContactsPageContext', () => {
  it('has a contact id and switches from list to flows', async () => {
    const { getByText, findByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: { accountListId, contactId: ['list', 'abc'] },
            pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
            isReady,
            replace,
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
            <ContactsWrapper>
              <TestRender />
            </ContactsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    expect(getByText('Loading')).toBeInTheDocument();
    userEvent.click(await findByText('Flows Button'));
    expect(await findByText('flows')).toBeInTheDocument();
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith({
        pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
        query: {
          accountListId: 'account-list-1',
          contactId: ['flows', 'abc'],
        },
      }),
    );
  });

  it('has a contact id and switches twice', async () => {
    const { getByText, findByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: { accountListId, contactId: ['list', 'abc'] },
            pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
            isReady,
            replace,
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
            <ContactsWrapper>
              <TestRender />
            </ContactsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    expect(getByText('Loading')).toBeInTheDocument();
    userEvent.click(await findByText('Map Button'));
    expect(await findByText('map')).toBeInTheDocument();
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith({
        pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
        query: {
          accountListId: 'account-list-1',
          contactId: ['map', 'abc'],
        },
      }),
    );

    userEvent.click(getByText('List Button'));
    expect(await findByText('list')).toBeInTheDocument();
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith({
        pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
        query: {
          accountListId: 'account-list-1',
          contactId: ['abc'],
        },
      }),
    );
  });

  it('does not have a contact id and changes to map', async () => {
    const { getByText, findByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: { accountListId },
            pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
            isReady,
            replace,
          }}
        >
          <GqlMockedProvider<{ GetUserOptions: GetUserOptionsQuery }>
            mocks={{
              GetUserOptions: {
                userOptions: [
                  {
                    id: 'test-id',
                    key: 'contacts_view',
                    value: 'list',
                  },
                ],
              },
            }}
          >
            <ContactsWrapper>
              <TestRender />
            </ContactsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    expect(getByText('Loading')).toBeInTheDocument();
    userEvent.click(await findByText('Map Button'));
    expect(await findByText('map')).toBeInTheDocument();
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith({
        pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
        query: {
          accountListId: 'account-list-1',
          contactId: [],
        },
      }),
    );
  });

  it('Saved Filters with correct JSON', async () => {
    const userOptions = [
      {
        id: '123',
        key: 'saved_contacts_filter_My_Cool_Filter',
        value: `{"any_tags":false,"account_list_id":"${accountListId}","params":{"status": "true"},"tags":null,"exclude_tags":null,"wildcard_search":""}`,
      },
    ];
    const { findByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: { accountListId },
            pathname: '/accountLists/[accountListId]/contacts',
            isReady,
          }}
        >
          <GqlMockedProvider<{
            GetUserOptions: GetUserOptionsQuery;
            ContactFilters: ContactFiltersQuery;
          }>
            mocks={{
              GetUserOptions: {
                userOptions,
              },
              ContactFilters: {
                userOptions,
              },
            }}
          >
            <ContactsWrapper>
              <TestRenderContactsFilters />
            </ContactsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    expect(await findByTestId('savedfilters-testid')).toBeInTheDocument();
  });

  it('Saved Filters with incorrect JSON', async () => {
    const userOptions = [
      {
        id: '123',
        key: 'saved_contacts_filter_My_Cool_Filter',
        value: `{"any_tags":false,"account_list_id":"${accountListId}","params":{"status" error },"tags":null,"exclude_tags":null,"wildcard_search":""}`,
      },
    ];

    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: { accountListId },
            pathname: '/accountLists/[accountListId]/contacts',
            isReady,
          }}
        >
          <GqlMockedProvider<{
            GetUserOptions: GetUserOptionsQuery;
            ContactFilters: ContactFiltersQuery;
          }>
            mocks={{
              GetUserOptions: {
                userOptions,
              },
              ContactFilters: {
                userOptions,
              },
            }}
          >
            <ContactsWrapper>
              <TestRenderContactsFilters />
            </ContactsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(queryByTestId('savedfilters-testid')).not.toBeInTheDocument(),
    );
  });
});
