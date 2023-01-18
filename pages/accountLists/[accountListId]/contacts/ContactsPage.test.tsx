import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import userEvent from '@testing-library/user-event';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ThemeProvider } from '@mui/material/styles';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../__tests__/util/graphqlMocking';
import {
  mockDateRangeFilter,
  mockMultiselectFilter,
  mockTextFilter,
} from 'src/components/Shared/Filters/FilterPanel.mocks';
import { FilterPanel } from 'src/components/Shared/Filters/FilterPanel';
import {
  FilterPanelGroupFragment,
  FilterPanelGroupFragmentDoc,
  UserOptionFragment,
  UserOptionFragmentDoc,
} from 'src/components/Shared/Filters/FilterPanel.generated';
import { SaveFilterMutation } from 'src/components/Shared/Filters/SaveFilterModal/SaveFilterModal.generated';
import theme from 'src/theme';
import { ContactsPage } from './ContactsPage';
import { ContactFilterStatusEnum } from '../../../../graphql/types.generated';

const onSelectedFiltersChanged = jest.fn();
const onClose = jest.fn();

const filterPanelDefaultMock = gqlMock<FilterPanelGroupFragment>(
  FilterPanelGroupFragmentDoc,
  {
    mocks: {
      name: 'Group 1',
      featured: false,
      filters: [mockTextFilter, mockMultiselectFilter],
    },
  },
);
const filterPanelFeaturedMock = gqlMock<FilterPanelGroupFragment>(
  FilterPanelGroupFragmentDoc,
  {
    mocks: {
      name: 'Group 2',
      featured: true,
      filters: [mockMultiselectFilter, mockDateRangeFilter],
    },
  },
);

const savedFiltersMock = gqlMock<UserOptionFragment>(UserOptionFragmentDoc, {
  mocks: {
    id: '123',
    key: 'saved_contacts_filter_My_Cool_Filter',
    value:
      '{"any_tags":false,"account_list_id":"08bb09d1-3b62-4690-9596-b625b8af4750","params":{"status":"active,hidden,null,Never Contacted,Ask in Future,Cultivate Relationship,Contact for Appointment,Appointment Scheduled,Call for Decision,Partner - Financial,Partner - Special,Partner - Pray,Not Interested,Unresponsive,Never Ask,Research Abandoned,Expired Referral","pledge_received":"true","pledge_amount":"35.0,40.0","pledge_currency":"USD","pledge_frequency":"0.46153846153846,1.0","pledge_late_by":"30_60","newsletter":"no_value","referrer":"d5b1dab5-e3ae-417d-8f49-2abdd915515b","city":"Evansville","state":"FL","country":"United States","metro_area":"Cool","region":"Orange County","contact_info_email":"Yes","contact_info_phone":"No","contact_info_mobile":"No","contact_info_work_phone":"No","contact_info_addr":"Yes","contact_info_facebook":"No","opt_out":"No","church":"Cool Church II","appeal":"851769ba-b55d-45f3-b784-c4eca7ae99fd,77491693-df83-46ec-b40b-39d07333f47e","timezone":"America/Vancouver","locale":"English","donation":"first","donation_date":"2021-12-23..2021-12-23","next_ask":"2021-11-30..2021-12-22","user_ids":"787f286e-fe38-4055-b9fc-0177a0f55947","reverse_appeal":true, "contact_types": "person"},"tags":null,"exclude_tags":null,"wildcard_search":""}',
  },
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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useRouter = jest.spyOn(require('next/router'), 'useRouter');

describe('Contacts', () => {
  it('opens and selects a saved filter X2', async () => {
    const routeReplace = jest.fn();
    const routePush = jest.fn();
    useRouter.mockReturnValue({
      route: '/contacts',
      query: {
        accountListI: 'account-list-1',
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
          <GqlMockedProvider<SaveFilterMutation>>
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
});
