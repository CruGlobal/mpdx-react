import React, { useContext } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactFiltersQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { useUrlFilters } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { GetIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import theme from '../../../theme';
import { TableViewModeEnum } from '../../Shared/Header/ListHeader';
import {
  ContactsContext,
  ContactsType,
  parseSavedFilters,
} from './ContactsContext';

const accountListId = 'account-list-1';
const contactId = '00000000-0000-0000-0000-000000000000';
const push = jest.fn();
const mutationSpy = jest.fn();

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

interface TestWrapper {
  contactId?: string[];
  contactView?: string;
  savedFilter?: string;
  children: JSX.Element;
}

const TestWrapper: React.FC<TestWrapper> = ({
  contactId,
  contactView = 'list',
  savedFilter,
  children,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <TestRouter
        router={{
          query: { accountListId, contactId },
          pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
          isReady: true,
          push,
        }}
      >
        <GqlMockedProvider<{
          GetIdsForMassSelection: GetIdsForMassSelectionQuery;
          UserOption: UserOptionQuery;
          ContactFilters: ContactFiltersQuery;
        }>
          mocks={{
            GetIdsForMassSelection: {
              contacts: {
                nodes: [{ id: 'contact-1' }],
              },
            },
            UserOption: {
              userOption: {
                key: 'contacts_view',
                value: contactView,
              },
            },
            ContactFilters: {
              userOptions: [
                {
                  key: 'saved_contacts_filter_My_Cool_Filter',
                  value: savedFilter ?? null,
                },
              ],
            },
          }}
          onCall={mutationSpy}
        >
          <ContactsWrapper>{children}</ContactsWrapper>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

const InnerComponent: React.FC = () => {
  const { viewMode, setViewMode, userOptionsLoading, toggleSelectionById } =
    useContext(ContactsContext) as ContactsType;
  const { activeFilters } = useUrlFilters();

  return (
    <div>
      {!userOptionsLoading ? (
        <>
          <Typography>{viewMode}</Typography>
          <Button onClick={() => setViewMode(TableViewModeEnum.List)}>
            List Button
          </Button>
          <Button onClick={() => setViewMode(TableViewModeEnum.Flows)}>
            Flows Button
          </Button>
          <Button onClick={() => setViewMode(TableViewModeEnum.Map)}>
            Map Button
          </Button>
        </>
      ) : (
        <>Loading</>
      )}
      <button onClick={() => toggleSelectionById('contact-1')}>
        Select contact
      </button>
      <div data-testid="active-filters">{JSON.stringify(activeFilters)}</div>
    </div>
  );
};

const TestRenderContactsFilters: React.FC = () => {
  const { filterData } = useContext(ContactsContext) as ContactsType;
  const savedFilters = parseSavedFilters(filterData, accountListId);
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
      <TestWrapper contactId={['list', contactId]}>
        <InnerComponent />
      </TestWrapper>,
    );

    expect(getByText('Loading')).toBeInTheDocument();
    userEvent.click(await findByText('Flows Button'));
    expect(await findByText('flows')).toBeInTheDocument();
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        {
          pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
          query: {
            accountListId: 'account-list-1',
            contactId: ['flows', contactId],
          },
        },
        undefined,
        { shallow: true },
      ),
    );
  });

  it('has a contact id and switches twice', async () => {
    const { getByText, findByText } = render(
      <TestWrapper contactId={['list', contactId]} contactView="flows">
        <InnerComponent />
      </TestWrapper>,
    );

    expect(getByText('Loading')).toBeInTheDocument();
    userEvent.click(await findByText('Map Button'));
    expect(await findByText('map')).toBeInTheDocument();
    await waitFor(() =>
      expect(push).toHaveBeenLastCalledWith(
        {
          pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
          query: {
            accountListId: 'account-list-1',
            contactId: ['map', contactId],
          },
        },
        undefined,
        { shallow: true },
      ),
    );

    userEvent.click(getByText('List Button'));
    expect(await findByText('list')).toBeInTheDocument();
    await waitFor(() =>
      expect(push).toHaveBeenLastCalledWith(
        {
          pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
          query: {
            accountListId: 'account-list-1',
            contactId: [contactId],
          },
        },
        undefined,
        { shallow: true },
      ),
    );
  });

  it('does not have a contact id and changes to map', async () => {
    const { getByText, findByText } = render(
      <TestWrapper contactView="list">
        <InnerComponent />
      </TestWrapper>,
    );

    expect(getByText('Loading')).toBeInTheDocument();
    userEvent.click(await findByText('Map Button'));
    expect(await findByText('map')).toBeInTheDocument();
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        {
          pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
          query: {
            accountListId: 'account-list-1',
            contactId: ['map'],
          },
        },
        undefined,
        { shallow: true },
      ),
    );
  });

  it('shows the selected contacts on the map', async () => {
    const { findByRole, getByRole, getByTestId } = render(
      <TestWrapper>
        <InnerComponent />
      </TestWrapper>,
    );

    userEvent.click(getByRole('button', { name: 'Select contact' }));
    userEvent.click(await findByRole('button', { name: 'Map Button' }));
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('Contacts', {
        contactsFilters: { ids: ['contact-1'] },
      }),
    );

    userEvent.click(getByRole('button', { name: 'List Button' }));
    expect(getByTestId('active-filters')).toHaveTextContent('{}');
  });

  it('Saved Filters with correct JSON', async () => {
    const savedFilter = `{"any_tags":false,"account_list_id":"${accountListId}","params":{"status": "true"},"tags":null,"exclude_tags":null,"wildcard_search":""}`;
    const { findByTestId } = render(
      <TestWrapper savedFilter={savedFilter}>
        <TestRenderContactsFilters />
      </TestWrapper>,
    );

    expect(await findByTestId('savedfilters-testid')).toBeInTheDocument();
  });

  it('Saved Filters with incorrect JSON', async () => {
    const savedFilter = `{"any_tags":false,"account_list_id":"${accountListId}","params":{"status" error },"tags":null,"exclude_tags":null,"wildcard_search":""}`;

    const { queryByTestId } = render(
      <TestWrapper savedFilter={savedFilter}>
        <TestRenderContactsFilters />
      </TestWrapper>,
    );

    await waitFor(() =>
      expect(queryByTestId('savedfilters-testid')).not.toBeInTheDocument(),
    );
  });
});
