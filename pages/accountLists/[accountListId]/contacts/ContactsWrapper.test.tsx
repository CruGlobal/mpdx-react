import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  ContactDetailContext,
  ContactDetailProvider,
} from 'src/components/Contacts/ContactDetails/ContactDetailContext';
import {
  ContactsContext,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { FilterPanel } from 'src/components/Shared/Filters/FilterPanel';
import {
  filterPanelDefaultMock,
  filterPanelFeaturedMock,
  savedFiltersMock,
} from 'src/components/Shared/Filters/FilterPanel.mocks';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { ContactFilterStatusEnum } from 'src/graphql/types.generated';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import theme from 'src/theme';
import { ContactsWrapper } from './ContactsWrapper';

const onClose = jest.fn();

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

const deserializeFilters = (filters: string) =>
  JSON.parse(decodeURIComponent(filters));

describe('ContactsWrapper', () => {
  it('opens and selects a saved filter X2', async () => {
    const routerReplace = jest.fn();
    const router = {
      pathname: '/contacts',
      query: {
        accountListId: 'account-list-1',
      },
      replace: routerReplace,
      isReady: true,
    };

    const {
      getByTestId,
      getByText,
      queryByTestId,
      queryAllByTestId,
      getByRole,
    } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider>
              <ContactsWrapper>
                <FilterPanel
                  filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                  savedFilters={[savedFiltersMock]}
                  onClose={onClose}
                />
              </ContactsWrapper>
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </LocalizationProvider>,
    );

    await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
    expect(queryByTestId('LoadingState')).toBeNull();
    expect(queryByTestId('ErrorState')).toBeNull();

    expect(queryAllByTestId('FilterGroup').length).toEqual(2);
    expect(getByTestId('FilterListItemShowAll')).toBeVisible();
    userEvent.click(getByTestId('FilterListItemShowAll'));
    userEvent.click(getByText(filterPanelDefaultMock.name));

    userEvent.click(
      getByRole('button', {
        hidden: true,
        name: 'Group 1',
      }),
    );

    const statusSelect = getByRole('combobox', {
      hidden: true,
      name: 'Status',
    });
    userEvent.click(statusSelect);

    await waitFor(() =>
      expect(getByText('Contact for Appointment')).toBeInTheDocument(),
    );
    userEvent.click(
      await within(getByRole('presentation')).findByText(
        'Contact for Appointment',
      ),
    );
    expect(getByTestId('multiSelectFilter')).toBeInTheDocument();
    expect(
      deserializeFilters(routerReplace.mock.lastCall[0].query.filters),
    ).toEqual({
      status: [ContactFilterStatusEnum.ContactForAppointment],
    });
    userEvent.click(getByText('Saved Filters'));
    expect(routerReplace).toHaveBeenCalled();
  });
});

it('shows the list and keeps the saved view mode in offline mode', async () => {
  const mutationSpy = jest.fn();
  const ViewMode: React.FC = () => {
    const { viewMode } = React.useContext(ContactsContext) as ContactsType;
    return <div data-testid="view-mode">{viewMode}</div>;
  };

  const { findByTestId } = render(
    <ThemeProvider theme={theme}>
      <TestRouter
        router={{
          pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
          query: { accountListId: 'account-list-1', offline: 'true' },
          isReady: true,
        }}
      >
        <GqlMockedProvider<{ UserOption: UserOptionQuery }>
          mocks={{
            UserOption: {
              userOption: { key: 'contacts_view', value: 'flows' },
            },
          }}
          onCall={mutationSpy}
        >
          <ContactsWrapper>
            <ViewMode />
          </ContactsWrapper>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );

  await waitFor(() => expect(mutationSpy).toHaveGraphqlOperation('UserOption'));
  expect(await findByTestId('view-mode')).toHaveTextContent('list');
  expect(mutationSpy).not.toHaveGraphqlOperation('UpdateUserOption');
});

describe('picking a view in offline mode', () => {
  const ViewModeButtons: React.FC = () => {
    const { setViewMode } = React.useContext(ContactsContext) as ContactsType;
    return (
      <>
        <button onClick={() => setViewMode(TableViewModeEnum.Map)}>Map</button>
        <button onClick={() => setViewMode(TableViewModeEnum.List)}>
          List
        </button>
      </>
    );
  };

  const renderOffline = (offline: string | undefined) => {
    const routerReplace = jest.fn();
    const mutationSpy = jest.fn();
    const utils = render(
      <ThemeProvider theme={theme}>
        <TestRouter
          router={{
            pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
            query: { accountListId: 'account-list-1', offline },
            replace: routerReplace,
            isReady: true,
          }}
        >
          <GqlMockedProvider<{ UserOption: UserOptionQuery }>
            mocks={{
              UserOption: {
                userOption: { key: 'contacts_view', value: 'list' },
              },
            }}
            onCall={mutationSpy}
          >
            <ContactsWrapper>
              <ViewModeButtons />
            </ContactsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );
    return { ...utils, routerReplace, mutationSpy };
  };

  it('removes offline from the URL when picking Map', async () => {
    const { getByRole, routerReplace, mutationSpy } = renderOffline('true');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UserOption'),
    );
    routerReplace.mockClear();
    userEvent.click(getByRole('button', { name: 'Map' }));

    expect(routerReplace).toHaveBeenCalledWith(
      {
        pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
        query: { accountListId: 'account-list-1' },
      },
      undefined,
      { shallow: true },
    );
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateUserOption', {
        key: 'contacts_view',
        value: 'map',
      }),
    );
  });

  it('keeps offline mode when picking List', async () => {
    const { getByRole, routerReplace, mutationSpy } = renderOffline('true');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UserOption'),
    );
    routerReplace.mockClear();
    userEvent.click(getByRole('button', { name: 'List' }));

    expect(routerReplace).not.toHaveBeenCalled();
  });

  it('does not touch the URL outside of offline mode', async () => {
    const { getByRole, routerReplace, mutationSpy } = renderOffline(undefined);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UserOption'),
    );
    routerReplace.mockClear();
    userEvent.click(getByRole('button', { name: 'Map' }));

    expect(routerReplace).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateUserOption', {
        key: 'contacts_view',
        value: 'map',
      }),
    );
  });
});

it('updates personId in URL when a different person is selected', async () => {
  const routeReplace = jest.fn();
  const router = {
    pathname: '/contacts',
    query: {
      accountListId: 'account-list-1',
      contactId: ['contact-1'],
      personId: 'person-1',
    },
    replace: routeReplace,
    isReady: true,
  };

  const TestComponent = () => {
    const context = React.useContext(ContactDetailContext);
    useEffect(() => {
      context?.openPersonModal('person-2');
    }, [context]);
    return null;
  };

  render(
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <ContactDetailProvider>
              <TestComponent />
            </ContactDetailProvider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>
    </LocalizationProvider>,
  );

  await waitFor(() => {
    expect(routeReplace).toHaveBeenCalled();
  });

  const [[replaceCall]] = routeReplace.mock.calls;
  expect(replaceCall.query.personId).toBe('person-2');
});
