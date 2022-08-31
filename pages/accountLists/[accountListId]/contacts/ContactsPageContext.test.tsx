import React, { useContext } from 'react';
import { render, waitFor } from '@testing-library/react';
import { Box, Button, ThemeProvider, Typography } from '@mui/material';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import TestRouter from '../../../../__tests__/util/TestRouter';
import theme from '../../../../src/theme';
import { useMassSelection } from '../../../../src/hooks/useMassSelection';
import {
  ListHeaderCheckBoxState,
  TableViewModeEnum,
} from '../../../../src/components/Shared/Header/ListHeader';
import {
  ContactsPageContext,
  ContactsPageProvider,
  ContactsPageType,
} from './ContactsPageContext';
import { GetUserOptionsQuery } from 'src/components/Contacts/ContactFlow/GetUserOptions.generated';

const accountListId = 'account-list-1';
const push = jest.fn();
const isReady = true;

jest.mock('../../../../src/hooks/useMassSelection');

(useMassSelection as jest.Mock).mockReturnValue({
  selectionType: ListHeaderCheckBoxState.unchecked,
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
    ContactsPageContext,
  ) as ContactsPageType;
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

it('has a contact id', async () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <TestRouter
        router={{
          query: { accountListId, contactId: ['list', 'abc'] },
          isReady,
          push,
        }}
      >
        <GqlMockedProvider<GetUserOptionsQuery>
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
          <ContactsPageProvider>
            <TestRender />
          </ContactsPageProvider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );
  expect(getByText('Loading')).toBeInTheDocument();
  await waitFor(() => expect(getByText('Flows Button')).toBeInTheDocument());
  await waitFor(() => userEvent.click(getByText('Flows Button')));
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
          isReady,
          push,
        }}
      >
        <GqlMockedProvider<GetUserOptionsQuery>
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
          <ContactsPageProvider>
            <TestRender />
          </ContactsPageProvider>
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
          isReady,
          push,
        }}
      >
        <GqlMockedProvider<GetUserOptionsQuery>
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
          <ContactsPageProvider>
            <TestRender />
          </ContactsPageProvider>
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
      pathname: '/accountLists/account-list-1/contacts//map',
      query: {},
    }),
  );
});
