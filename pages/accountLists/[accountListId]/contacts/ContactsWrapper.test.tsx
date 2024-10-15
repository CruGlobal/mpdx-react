import React, { useContext } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  ContactsContext,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { FilterPanel } from 'src/components/Shared/Filters/FilterPanel';
import {
  filterPanelDefaultMock,
  filterPanelFeaturedMock,
  filterPanelTagsMock,
  savedFiltersMock,
} from 'src/components/Shared/Filters/FilterPanel.mocks';
import { ContactFilterStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ContactsWrapper, extractContactId } from './ContactsWrapper';

const onSelectedFiltersChanged = jest.fn();
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

describe('ContactsWrapper', () => {
  it('opens and selects a saved filter X2', async () => {
    const routeReplace = jest.fn();
    const router = {
      pathname: '/contacts',
      query: {
        accountListId: 'account-list-1',
        filters: '%7B%22status%22:%5B%22ASK_IN_FUTURE%22%5D%7D',
      },
      replace: routeReplace,
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
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
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
    expect(onSelectedFiltersChanged).toHaveBeenCalledWith({
      status: [ContactFilterStatusEnum.ContactForAppointment],
    });
    userEvent.click(getByText('Saved Filters'));
    expect(routeReplace).toHaveBeenCalled();
  });

  it('tags any/all toggle does not update the URL if no tags are selected', () => {
    const routeReplace = jest.fn();
    const router = {
      pathname: '/contacts',
      query: {
        accountListId: 'account-list-1',
        filters: '%7B%7D',
      },
      replace: routeReplace,
      isReady: true,
    };

    const ComponentWrapper: React.FC = () => {
      const { activeFilters, setActiveFilters } = useContext(
        ContactsContext,
      ) as ContactsType;

      return (
        <FilterPanel
          filters={[filterPanelTagsMock]}
          savedFilters={[savedFiltersMock]}
          selectedFilters={activeFilters}
          onClose={onClose}
          onSelectedFiltersChanged={setActiveFilters}
        />
      );
    };

    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider>
              <ContactsWrapper>
                <ComponentWrapper />
              </ContactsWrapper>
            </GqlMockedProvider>
          </ThemeProvider>
        </TestRouter>
      </LocalizationProvider>,
    );

    userEvent.click(
      within(getByRole('button', { name: /^Tags/ })).getByTestId(
        'ExpandMoreIcon',
      ),
    );

    userEvent.click(getByRole('button', { name: 'Any' }));
    expect(routeReplace).toHaveBeenLastCalledWith({
      pathname: '/contacts',
      query: { accountListId: 'account-list-1' },
    });

    userEvent.click(getByRole('button', { name: 'Tag 1' }));
    expect(routeReplace).toHaveBeenLastCalledWith({
      pathname: '/contacts',
      query: {
        accountListId: 'account-list-1',
        filters: '%7B%22tags%22:%5B%22Tag%201%22%5D,%22anyTags%22:true%7D',
      },
    });

    userEvent.click(getByRole('button', { name: 'All' }));
    expect(routeReplace).toHaveBeenLastCalledWith({
      pathname: '/contacts',
      query: {
        accountListId: 'account-list-1',
        filters: '%7B%22tags%22:%5B%22Tag%201%22%5D%7D',
      },
    });
  });
});

describe('extractContactId', () => {
  it('returns the last item in the contactId query param', () => {
    expect(
      extractContactId({
        contactId: ['flows', 'contact-1'],
      }),
    ).toBe('contact-1');
  });

  it('returns undefined when the last item in the contactId query param is the view mode', () => {
    expect(
      extractContactId({
        contactId: ['flows'],
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the last item in the contactId query param is empty', () => {
    expect(
      extractContactId({
        contactId: [],
      }),
    ).toBeUndefined();
  });
});
