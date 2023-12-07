import React, { useContext } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from 'src/components/Shared/Filters/FilterPanel';
import {
  filterPanelDefaultMock,
  filterPanelFeaturedMock,
  filterPanelTagsMock,
  savedFiltersMock,
} from 'src/components/Shared/Filters/FilterPanel.mocks';
import theme from 'src/theme';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactFilterStatusEnum } from '../../../../graphql/types.generated';
import { ContactsContext, ContactsType } from './ContactsContext';
import { ContactsPage } from './ContactsPage';

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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useRouter = jest.spyOn(require('next/router'), 'useRouter');

describe('Contacts', () => {
  it('opens and selects a saved filter X2', async () => {
    const routeReplace = jest.fn();
    const routePush = jest.fn();
    useRouter.mockReturnValue({
      route: '/contacts',
      query: {
        accountListId: 'account-list-1',
        filters: '%7B%22status%22:%5B%22ASK_IN_FUTURE%22%5D%7D',
      },
      replace: routeReplace,
      push: routePush,
    });

    const {
      getByTestId,
      getByText,
      queryByTestId,
      queryAllByTestId,
      getByRole,
    } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ContactsPage>
              <FilterPanel
                filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                savedFilters={[savedFiltersMock]}
                selectedFilters={{}}
                onClose={onClose}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
            </ContactsPage>
          </GqlMockedProvider>
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
    const routePush = jest.fn();
    useRouter.mockReturnValue({
      route: '/contacts',
      query: {
        accountListId: 'account-list-1',
        filters: '%7B%7D',
      },
      replace: routeReplace,
      push: routePush,
    });

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
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <ContactsPage>
              <ComponentWrapper />
            </ContactsPage>
          </GqlMockedProvider>
        </ThemeProvider>
      </LocalizationProvider>,
    );

    userEvent.click(
      within(getByRole('button', { name: /^Tags/ })).getByTestId(
        'ExpandMoreIcon',
      ),
    );

    userEvent.click(getByRole('button', { name: 'Any' }));
    expect(routeReplace).toHaveBeenLastCalledWith({
      pathname: undefined,
      query: { accountListId: 'account-list-1' },
    });

    userEvent.click(getByRole('button', { name: 'Tag 1' }));
    expect(routeReplace).toHaveBeenLastCalledWith({
      pathname: undefined,
      query: {
        accountListId: 'account-list-1',
        filters: '%7B%22tags%22:%5B%22Tag%201%22%5D,%22anyTags%22:true%7D',
      },
    });

    userEvent.click(getByRole('button', { name: 'All' }));
    expect(routeReplace).toHaveBeenLastCalledWith({
      pathname: undefined,
      query: {
        accountListId: 'account-list-1',
        filters: '%7B%22tags%22:%5B%22Tag%201%22%5D%7D',
      },
    });
  });
});
