import { ApolloCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { getSession } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { fetchAllData } from 'src/lib/deserializeJsonApi';
import theme from 'src/theme';
import GoogleImport from './GoogleImport';
import { mockGoogleContactGroupsResponse } from './GoogleImportMocks';
import { GoogleContactGroupsQuery } from './googleContactGroups.generated';

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

jest.mock('src/lib/deserializeJsonApi');

const accountListId = 'account-id';
const router = {
  pathname: `/accountLists/${accountListId}/tools`,
  push: jest.fn(),
  isReady: true,
};

const TestComponent = ({
  mocks,
  cache,
  onCall,
}: {
  mocks: ApolloErgonoMockMap;
  cache?: ApolloCache<object>;
  onCall?: MockLinkCallHandler;
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GoogleContactGroups: GoogleContactGroupsQuery;
        }>
          mocks={mocks}
          cache={cache}
          onCall={onCall}
        >
          <GoogleImport accountListId={accountListId} />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('Google Import', () => {
  const googleAccounts =
    mockGoogleContactGroupsResponse.GoogleContactGroups.googleAccounts;
  const account1Email = googleAccounts[0].email;
  const account2Email = googleAccounts[1].email;
  const account3Email = googleAccounts[2].email;
  const account1GroupName = googleAccounts[0].contactGroups[0].title;
  const account2GroupName = googleAccounts[1].contactGroups[0].title;
  const account2GroupTag = googleAccounts[1].contactGroups[0].tag;

  describe('render', () => {
    it('multiple Google accounts', async () => {
      const {
        getByText,
        findByText,
        getAllByText,
        getAllByRole,
        queryByText,
        getByRole,
      } = render(<TestComponent mocks={mockGoogleContactGroupsResponse} />);

      expect(await findByText('Account to Import From')).toBeVisible();
      expect(await findByText(account1GroupName)).toBeVisible();

      await waitFor(() => {
        expect(getAllByText(account1Email)[0]).toBeVisible();
      });
      const importButton = getByRole('button', { name: 'Import' });

      //Switch to a different google account
      const accountDropdown = getAllByRole('combobox')[0];
      userEvent.click(accountDropdown);
      userEvent.click(getByText(account2Email));

      expect(await findByText(account2GroupName)).toBeVisible();
      expect(queryByText(account1GroupName)).not.toBeInTheDocument();

      //Hides the contact groups when selecting All Contacts
      userEvent.click(getByText('Import all contacts'));
      expect(queryByText(account2GroupName)).not.toBeVisible();
      userEvent.click(importButton);
      expect(await findByText('Confirm Import All')).toBeVisible();
      userEvent.click(getByRole('button', { name: 'No' }));

      //Check that the Import Button is disabled when no groups are checked
      userEvent.click(getByText('Only import contacts from certain groups'));
      expect(importButton).toBeDisabled();
      userEvent.click(getByText(account2GroupName));
      expect(importButton).not.toBeDisabled();
    });

    it('single Google account', async () => {
      const { getByText, getAllByText, queryByText } = render(
        <TestComponent
          mocks={{
            GoogleContactGroups: {
              googleAccounts: [
                mockGoogleContactGroupsResponse.GoogleContactGroups
                  .googleAccounts[0],
              ],
            },
          }}
        />,
      );
      await waitFor(() => {
        expect(queryByText('Account to Import From')).not.toBeInTheDocument();
        expect(getAllByText(account1Email)[0]).toBeVisible();
        expect(getByText(account1GroupName)).toBeVisible();
      });
    });

    it('single Google account with no groups/labels', async () => {
      const { getByText, getByRole, findByText } = render(
        <TestComponent
          mocks={{
            GoogleContactGroups: {
              googleAccounts: [
                mockGoogleContactGroupsResponse.GoogleContactGroups
                  .googleAccounts[2],
              ],
            },
          }}
        />,
      );

      expect(await findByText(account3Email)).toBeVisible();

      expect(
        getByText('You have no Google Contact groups/labels'),
      ).toBeVisible();

      //Check that the Import Button is disabled when no groups exist
      const importButton = getByRole('button', { name: 'Import' });
      expect(importButton).toBeDisabled();

      //Is not disabled when choosing to import all contacts
      userEvent.click(getByText('Import all contacts'));
      expect(importButton).not.toBeDisabled();
    });

    it('no Google accounts', async () => {
      const { findByText } = render(
        <TestComponent
          mocks={{
            GoogleContactGroups: {
              googleAccounts: [],
            },
          }}
        />,
      );

      expect(
        await findByText("You haven't connected a Google account yet"),
      ).toBeVisible();
    });
  });

  describe('Imports contacts', () => {
    const fetch = jest.fn();
    beforeEach(() => {
      (fetchAllData as jest.Mock).mockReturnValue({});
      (getSession as jest.Mock).mockReturnValue({
        user: { apiToken: 'token' },
      });
      fetch.mockResolvedValue({
        json: () => Promise.resolve({ success: true, data: { id: '1' } }),
      });
      window.fetch = fetch;
    });

    it('checks and unchecks all', async () => {
      const { getAllByRole, getByRole, getByText } = render(
        <TestComponent
          mocks={{
            GoogleContactGroups: {
              googleAccounts: [
                mockGoogleContactGroupsResponse.GoogleContactGroups
                  .googleAccounts[0],
              ],
            },
          }}
        />,
      );
      await waitFor(() => {
        expect(getByText(account1GroupName)).toBeInTheDocument();
      });
      const importButton = getByRole('button', { name: 'Import' });
      expect(importButton).toBeDisabled();

      userEvent.click(getByRole('button', { name: 'Check All' }));
      const checkboxes = getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).toBeChecked();
      expect(checkboxes[3]).toBeChecked();

      expect(importButton).not.toBeDisabled();

      userEvent.click(getByRole('button', { name: 'Uncheck All' }));
      expect(checkboxes[0]).not.toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[2]).not.toBeChecked();
      expect(checkboxes[3]).not.toBeChecked();

      expect(importButton).toBeDisabled();
    });

    it('makes fetch call', async () => {
      const { getAllByRole, findByText, getByRole, getByText, queryByText } =
        render(
          <TestComponent
            mocks={{
              GoogleContactGroups: {
                googleAccounts: [
                  mockGoogleContactGroupsResponse.GoogleContactGroups
                    .googleAccounts[1],
                ],
              },
            }}
          />,
        );
      await waitFor(() => {
        expect(getByText(account2GroupName)).toBeInTheDocument();
      });

      // Select checkbox
      userEvent.click(getByText(account2GroupName));

      // Adds tags by group
      const contactGroupTagAutocomplete = getAllByRole(
        'combobox',
      )[0] as HTMLInputElement;
      (expect(await findByText(account2GroupTag)).toBeInTheDocument(),
        userEvent.type(contactGroupTagAutocomplete, 'hello-world'));
      (expect(contactGroupTagAutocomplete.value).toBe('hello-world'),
        userEvent.type(contactGroupTagAutocomplete, '{enter}'));

      //Add tags for all
      const allTagAutocomplete = getAllByRole(
        'combobox',
      )[1] as HTMLInputElement;
      userEvent.type(allTagAutocomplete, 'googleImport{enter}');

      const importButton = getByRole('button', { name: 'Import' });
      userEvent.click(importButton);

      await waitFor(() => {
        expect(fetch.mock.calls[0][1]).toMatchObject({
          body: JSON.stringify({
            data: {
              attributes: {
                groups: ['contactGroups/asdf'],
                import_by_group: 'true',
                override: 'false',
                source: 'google',
                tag_list: 'googleImport',
                group_tags: {
                  'contactGroups/asdf': 'account-two-group,hello-world',
                },
              },
              relationships: {
                source_account: {
                  data: {
                    type: 'google_accounts',
                    id: '2',
                  },
                },
              },
              type: 'imports',
            },
          }),
          headers: {
            authorization: 'Bearer token',
            'content-type': 'application/vnd.api+json',
          },
          method: 'POST',
        });
      });

      expect(getByText('Good Work!')).toBeInTheDocument();
      userEvent.click(getByRole('button', { name: 'Ok' }));

      await waitFor(() => {
        expect(queryByText('Good Work!')).not.toBeInTheDocument();
        expect(mockEnqueue).toHaveBeenCalledWith(`Import has started`, {
          variant: 'success',
        });
      });

      expect(router.push).toHaveBeenCalledWith(
        `/accountLists/${accountListId}/tools`,
      );
    }, 15000);
  });

  describe('Handles errors', () => {
    const fetch = jest.fn();
    beforeEach(() => {
      (fetchAllData as jest.Mock).mockReturnValue({});
      (getSession as jest.Mock).mockReturnValue({
        user: { apiToken: 'token' },
      });
      fetch.mockRejectedValue({
        json: () => Promise.reject({ success: false, data: { id: '1' } }),
      });
      window.fetch = fetch;
    });

    it('shows error message', async () => {
      const { getByRole, getByText } = render(
        <TestComponent
          mocks={{
            GoogleContactGroups: {
              googleAccounts: [
                mockGoogleContactGroupsResponse.GoogleContactGroups
                  .googleAccounts[1],
              ],
            },
          }}
        />,
      );
      await waitFor(() => {
        expect(getByText(account2GroupName)).toBeInTheDocument();
      });

      // Select checkbox
      userEvent.click(getByText(account2GroupName));

      const importButton = getByRole('button', { name: 'Import' });
      userEvent.click(importButton);

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(`Import has failed`, {
          variant: 'error',
        });
      });
    });
  });
});
