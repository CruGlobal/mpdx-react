import React, { useContext } from 'react';
import { render, waitFor } from '@testing-library/react';
import { Box, Button, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
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
  ContactsContext,
  ContactsType,
  getRedirectPathname,
} from './ContactsContext';
import { GetUserOptionsQuery } from 'src/components/Contacts/ContactFlow/GetUserOptions.generated';
import { ContactsPage } from './ContactsPage';

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

describe('ContactsPageContext', () => {
  it.skip('has a contact id', async () => {
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

  it.skip('has a contact id and switches twice', async () => {
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

  it.skip('does not have a contact id and changes to map', async () => {
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
        pathname: '/accountLists/account-list-1/contacts//map',
        query: {},
      }),
    );
  });

  describe('getRedirectPathname', () => {
    it('should return the tasks URL when user is on the tasks page', async () => {
      // I tried to test this through rendering the component,
      // I couldn't work it out so I'm just testing the function instead.
      const pathname = getRedirectPathname(
        '/accountLists/[accountListId]/tasks/[[...contactId]]',
        accountListId,
      );

      expect(pathname).toBe('/accountLists/account-list-1/tasks');
    });

    it('should return the donations report URL when user is on the partner donations report page', async () => {
      const pathname = getRedirectPathname(
        '/accountLists/[accountListId]/reports/donations/[[...contactId]]',
        accountListId,
      );

      expect(pathname).toBe('/accountLists/account-list-1/reports/donations');
    });

    it('should return the partner giving analysis URL when user is on the partner giving analysis page', async () => {
      const pathname = getRedirectPathname(
        '/accountLists/[accountListId]/reports/partnerGivingAnalysis/[[...contactId]]',
        accountListId,
      );

      expect(pathname).toBe(
        '/accountLists/account-list-1/reports/partnerGivingAnalysis',
      );
    });
  });
});
