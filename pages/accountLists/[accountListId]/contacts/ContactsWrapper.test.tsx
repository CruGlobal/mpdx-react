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
import { FilterPanel } from 'src/components/Shared/Filters/FilterPanel';
import {
  filterPanelDefaultMock,
  filterPanelFeaturedMock,
  savedFiltersMock,
} from 'src/components/Shared/Filters/FilterPanel.mocks';
import { ContactFilterStatusEnum } from 'src/graphql/types.generated';
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
