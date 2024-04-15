import React, { useContext } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GetUserOptionsQuery } from 'src/components/Contacts/ContactFlow/GetUserOptions.generated';
import TestRouter from '../../../../__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import {
  ListHeaderCheckBoxState,
  TableViewModeEnum,
} from '../../../../src/components/Shared/Header/ListHeader';
import { useMassSelection } from '../../../../src/hooks/useMassSelection';
import theme from '../../../../src/theme';
import { ContactFiltersQuery } from './Contacts.generated';
import {
  ContactsContext,
  ContactsContextSavedFilters,
  ContactsType,
} from './ContactsContext';
import { ContactsPage } from './ContactsPage';

const accountListId = 'account-list-1';
const push = jest.fn();
const isReady = true;

jest.mock('../../../../src/hooks/useMassSelection');

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
  it('has a contact id', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: { accountListId, contactId: ['list', 'abc'] },
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
            <ContactsPage>
              <TestRender />
            </ContactsPage>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    expect(getByText('Loading')).toBeInTheDocument();
    await waitFor(() => expect(getByText('Flows Button')).toBeInTheDocument());
    userEvent.click(getByText('Flows Button'));
    await waitFor(() => expect(getByText('flows')).toBeInTheDocument());
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith({
        pathname: '/accountLists/account-list-1/contacts/flows/abc',
        query: {},
      }),
    );
  });

  it('has a contact id and switches twice', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: { accountListId, contactId: ['list', 'abc'] },
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
            <ContactsPage>
              <TestRender />
            </ContactsPage>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    expect(getByText('Loading')).toBeInTheDocument();
    await waitFor(() => expect(getByText('Map Button')).toBeInTheDocument());
    userEvent.click(getByText('Map Button'));
    await waitFor(() => expect(getByText('map')).toBeInTheDocument());
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith({
        pathname: '/accountLists/account-list-1/contacts/map/abc',
        query: {},
      }),
    );
    userEvent.click(getByText('List Button'));
    await waitFor(() => expect(getByText('list')).toBeInTheDocument());
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith({
        pathname: '/accountLists/account-list-1/contacts/abc',
        query: {},
      }),
    );
  });

  it('does not have a contact id and changes to map', async () => {
    const { getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            query: { accountListId },
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
                    value: 'list',
                  },
                ],
              },
            }}
          >
            <ContactsPage>
              <TestRender />
            </ContactsPage>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    expect(getByText('Loading')).toBeInTheDocument();
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() => expect(getByText('Map Button')).toBeInTheDocument());
    userEvent.click(getByText('Map Button'));
    await waitFor(() => expect(getByText('map')).toBeInTheDocument());
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith({
        pathname: '/accountLists/account-list-1/contacts/map',
        query: {},
      }),
    );
  });

  it('Saved Filters with correct JSON', async () => {
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
                    value: `{"any_tags":false,"account_list_id":"${accountListId}","params":{"status": "true"},"tags":null,"exclude_tags":null,"wildcard_search":""}`,
                  },
                ],
              },
            }}
          >
            <ContactsPage>
              <TestRenderContactsFilters />
            </ContactsPage>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('savedfilters-testid')).toBeInTheDocument(),
    );
  });

  it('Saved Filters with incorrect JSON', async () => {
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
            <ContactsPage>
              <TestRenderContactsFilters />
            </ContactsPage>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('savedfilters-testid')).not.toBeInTheDocument(),
    );
  });
});
