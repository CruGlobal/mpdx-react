import React from 'react';
import { render, waitFor } from '@testing-library/react';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { useRouter } from 'next/router';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../__tests__/util/graphqlMocking';
import {
  ContactFilterStatusEnum,
  MultiselectFilter,
} from '../../../../graphql/types.generated';
import {
  mockDateRangeFilter,
  mockMultiselectFilter,
  mockTextFilter,
} from './FilterPanel.mocks';
import { FilterPanel } from './FilterPanel';
import {
  FilterPanelGroupFragment,
  FilterPanelGroupFragmentDoc,
  UserOptionFragment,
  UserOptionFragmentDoc,
} from './FilterPanel.generated';
import { SaveFilterMutation } from './SaveFilterModal/SaveFilterModal.generated';

const onSelectedFiltersChanged = jest.fn();
const onClose = jest.fn();

const filterPanelDefaultMock = gqlMock<FilterPanelGroupFragment>(
  FilterPanelGroupFragmentDoc,
  {
    mocks: {
      name: 'Group 1',
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

const savedGraphQLContactMock = gqlMock<UserOptionFragment>(
  UserOptionFragmentDoc,
  {
    mocks: {
      id: '7215b6a3-9085-4eb5-810d-01cdb6ccd997',
      key: 'graphql_saved_contacts_filter_GraphQL_Contact_Filter',
      value:
        '{"status":["ASK_IN_FUTURE","CONTACT_FOR_APPOINTMENT"],"accountListId":"08bb09d1-3b62-4690-9596-b625b8af4750"}',
    },
  },
);

const savedGraphQLTaskMock = gqlMock<UserOptionFragment>(
  UserOptionFragmentDoc,
  {
    mocks: {
      id: '7215b6a3-9085-4eb5-810d-01cdb6ccd997',
      key: 'graphql_saved_tasks_filter_GraphQL_Task_Filter',
      value:
        '{"status":["ASK_IN_FUTURE","CONTACT_FOR_APPOINTMENT"],"accountListId":"08bb09d1-3b62-4690-9596-b625b8af4750"}',
    },
  },
);

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

jest.mock('next/router');

describe('FilterPanel', () => {
  describe('Contacts', () => {
    beforeEach(() => {
      (useRouter as jest.Mock).mockReturnValue({
        route: '/contacts',
      });
    });
    it('default', async () => {
      const {
        getByTestId,
        getByText,
        queryByTestId,
        queryAllByTestId,
      } = render(
        <GqlMockedProvider<SaveFilterMutation>>
          <FilterPanel
            filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
            savedFilters={[savedFiltersMock]}
            selectedFilters={{}}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </GqlMockedProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();
      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();

      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();
      expect(getByText('Saved Filters')).toBeVisible();
      expect(getByText('See More Filters')).toBeVisible();

      userEvent.click(getByTestId('FilterListItemShowAll'));

      expect(getByText('See Fewer Filters')).toBeVisible();
      expect(getByText(filterPanelDefaultMock.name)).toBeVisible();
      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();
      userEvent.click(getByTestId('FilterListItemShowAll'));

      expect(getByText('See More Filters')).toBeVisible();

      await waitFor(() =>
        expect(getByText(filterPanelDefaultMock.name)).not.toBeVisible(),
      );
      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();
    });

    it('opens and selects a filter', async () => {
      const {
        getByTestId,
        getByText,
        queryByTestId,
        queryAllByTestId,
      } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <GqlMockedProvider<SaveFilterMutation>>
            <FilterPanel
              filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
              savedFilters={[savedFiltersMock]}
              selectedFilters={{}}
              onClose={onClose}
              onSelectedFiltersChanged={onSelectedFiltersChanged}
            />
          </GqlMockedProvider>
        </MuiPickersUtilsProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByTestId('FilterListItemShowAll'));
      userEvent.click(getByText(filterPanelDefaultMock.name));
      expect(getByText(filterPanelDefaultMock.filters[0].title)).toBeVisible();
      expect(getByText(filterPanelDefaultMock.filters[1].title)).toBeVisible();

      const option1 =
        (filterPanelDefaultMock.filters[1] as MultiselectFilter)?.options &&
        getByText(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (filterPanelDefaultMock.filters[1] as MultiselectFilter)?.options[0]
            .name,
        );
      expect(option1).toBeVisible();
      userEvent.click(queryAllByTestId('CheckboxIcon')[0]);
      expect(option1).toBeVisible();
      await waitFor(() =>
        userEvent.click(getByTestId('CloseFilterGroupButton')),
      );
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({
        status: [ContactFilterStatusEnum.ContactForAppointment],
      });
    });

    it('should display a selected filter', async () => {
      const { getByText, queryByTestId, getAllByTestId, getAllByRole } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <GqlMockedProvider<SaveFilterMutation>>
            <FilterPanel
              filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
              savedFilters={[savedFiltersMock]}
              selectedFilters={{
                status: [ContactFilterStatusEnum.ContactForAppointment],
              }}
              onClose={onClose}
              onSelectedFiltersChanged={onSelectedFiltersChanged}
            />
          </GqlMockedProvider>
        </MuiPickersUtilsProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(getAllByTestId('FilterGroup').length).toEqual(2);
      userEvent.click(getByText('Group 1 (1)'));
      expect(getByText(filterPanelDefaultMock.filters[0].title)).toBeVisible();
      expect(getByText(filterPanelDefaultMock.filters[1].title)).toBeVisible();

      expect(getByText('Group 1 (1)')).toBeVisible();

      expect(getAllByRole('checkbox')[0]).toBeChecked();
    });

    it('opens and selects a saved filter', async () => {
      const {
        getByTestId,
        getByText,
        queryByTestId,
        queryAllByTestId,
      } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <GqlMockedProvider<SaveFilterMutation>>
            <FilterPanel
              filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
              savedFilters={[savedFiltersMock, savedGraphQLContactMock]}
              selectedFilters={{}}
              onClose={onClose}
              onSelectedFiltersChanged={onSelectedFiltersChanged}
            />
          </GqlMockedProvider>
        </MuiPickersUtilsProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByText('Saved Filters'));
      expect(getByText('My Cool Filter')).toBeVisible();
      expect(getByText('GraphQL Contact Filter')).toBeVisible();
      userEvent.click(getByText('My Cool Filter'));
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({
        anyTags: false,
        appeal: [
          '851769ba-b55d-45f3-b784-c4eca7ae99fd',
          '77491693-df83-46ec-b40b-39d07333f47e',
        ],
        church: ['Cool Church II'],
        city: ['Evansville'],
        contactInfoAddr: 'Yes',
        contactInfoEmail: 'Yes',
        contactInfoFacebook: 'No',
        contactInfoMobile: 'No',
        contactInfoPhone: 'No',
        contactInfoWorkPhone: 'No',
        country: ['United States'],
        donation: ['first'],
        donationDate: {
          max: '2021-12-23',
          min: '2021-12-23',
        },
        excludeTags: null,
        locale: ['English'],
        metroArea: ['Cool'],
        newsletter: 'NO_VALUE',
        nextAsk: {
          max: '2021-12-22',
          min: '2021-11-30',
        },
        optOut: 'No',
        pledgeAmount: ['35.0', '40.0'],
        pledgeCurrency: ['USD'],
        pledgeFrequency: ['0.46153846153846', '1.0'],
        pledgeLateBy: '30_60',
        pledgeReceived: true,
        referrer: ['d5b1dab5-e3ae-417d-8f49-2abdd915515b'],
        region: ['Orange County'],
        reverseAppeal: false,
        state: ['FL'],
        status: [
          'ACTIVE',
          'HIDDEN',
          'NULL',
          'NEVER_CONTACTED',
          'ASK_IN_FUTURE',
          'CULTIVATE_RELATIONSHIP',
          'CONTACT_FOR_APPOINTMENT',
          'APPOINTMENT_SCHEDULED',
          'CALL_FOR_DECISION',
          'PARTNER_FINANCIAL',
          'PARTNER_SPECIAL',
          'PARTNER_PRAY',
          'NOT_INTERESTED',
          'UNRESPONSIVE',
          'NEVER_ASK',
          'RESEARCH_ABANDONED',
          'EXPIRED_REFERRAL',
        ],
        tags: null,
        timezone: ['America/Vancouver'],
        userIds: ['787f286e-fe38-4055-b9fc-0177a0f55947'],
        wildcardSearch: '',
      });
      expect(getByText('Filter')).toBeVisible();
    });

    it('closes panel', async () => {
      const { queryByTestId, getByLabelText } = render(
        <GqlMockedProvider<SaveFilterMutation>>
          <FilterPanel
            filters={[]}
            savedFilters={[savedFiltersMock]}
            selectedFilters={{}}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </GqlMockedProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      userEvent.click(getByLabelText('Close'));
      expect(onClose).toHaveBeenCalled();
    });

    it('clears filters', async () => {
      const { getByText, queryByTestId, queryAllByTestId } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <GqlMockedProvider<SaveFilterMutation>>
            <FilterPanel
              filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
              savedFilters={[savedFiltersMock]}
              selectedFilters={{
                status: [ContactFilterStatusEnum.ContactForAppointment],
              }}
              onClose={onClose}
              onSelectedFiltersChanged={onSelectedFiltersChanged}
            />
          </GqlMockedProvider>
        </MuiPickersUtilsProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByText('Group 1 (1)')).toBeVisible();

      await waitFor(() => userEvent.click(getByText('Clear All')));
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({});
    });

    it('no filters', async () => {
      const { queryByTestId, queryAllByTestId } = render(
        <GqlMockedProvider<SaveFilterMutation>>
          <FilterPanel
            filters={[]}
            savedFilters={[savedFiltersMock]}
            selectedFilters={{}}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </GqlMockedProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();
      expect(queryAllByTestId('FilterGroup').length).toEqual(0);
      expect(queryByTestId('FilterListItemShowAll')).toBeNull();
    });
  });

  describe('Tasks', () => {
    beforeEach(() => {
      (useRouter as jest.Mock).mockReturnValue({
        route: '/tasks',
      });
    });
    it('default', async () => {
      const {
        getByTestId,
        getByText,
        queryByTestId,
        queryAllByTestId,
      } = render(
        <GqlMockedProvider<SaveFilterMutation>>
          <FilterPanel
            filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
            savedFilters={[savedFiltersMock]}
            selectedFilters={{}}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </GqlMockedProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();
      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();

      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();

      expect(getByText('See More Filters')).toBeVisible();

      userEvent.click(getByTestId('FilterListItemShowAll'));

      expect(getByText('See Fewer Filters')).toBeVisible();
      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();
      expect(getByText(filterPanelDefaultMock.name)).toBeVisible();

      userEvent.click(getByTestId('FilterListItemShowAll'));

      expect(getByText('See More Filters')).toBeVisible();

      await waitFor(() =>
        expect(getByText(filterPanelDefaultMock.name)).not.toBeVisible(),
      );

      expect(getByText(filterPanelFeaturedMock.name)).toBeVisible();
    });

    it('opens and selects a filter', async () => {
      const {
        getByTestId,
        getByText,
        queryByTestId,
        queryAllByTestId,
      } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <GqlMockedProvider<SaveFilterMutation>>
            <FilterPanel
              filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
              savedFilters={[savedFiltersMock]}
              selectedFilters={{}}
              onClose={onClose}
              onSelectedFiltersChanged={onSelectedFiltersChanged}
            />
          </GqlMockedProvider>
        </MuiPickersUtilsProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByTestId('FilterListItemShowAll'));
      userEvent.click(getByText(filterPanelDefaultMock.name));
      expect(getByText(filterPanelDefaultMock.filters[0].title)).toBeVisible();
      expect(getByText(filterPanelDefaultMock.filters[1].title)).toBeVisible();
      const option1 =
        (filterPanelDefaultMock.filters[1] as MultiselectFilter)?.options &&
        getByText(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (filterPanelDefaultMock.filters[1] as MultiselectFilter).options[0]
            .name,
        );
      expect(option1).toBeVisible();
      userEvent.click(queryAllByTestId('CheckboxIcon')[0]);
      expect(option1).toBeVisible();
      await waitFor(() =>
        userEvent.click(getByTestId('CloseFilterGroupButton')),
      );

      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({
        status: [ContactFilterStatusEnum.ContactForAppointment],
      });
    });

    it('opens and selects a saved filter', async () => {
      const {
        getByTestId,
        getByText,
        queryByTestId,
        queryAllByTestId,
      } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <GqlMockedProvider<SaveFilterMutation>>
            <FilterPanel
              filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
              savedFilters={[savedGraphQLTaskMock]}
              selectedFilters={{}}
              onClose={onClose}
              onSelectedFiltersChanged={onSelectedFiltersChanged}
            />
          </GqlMockedProvider>
        </MuiPickersUtilsProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByTestId('FilterListItemShowAll')).toBeVisible();
      userEvent.click(getByText('Saved Filters'));
      expect(getByText('GraphQL Task Filter')).toBeVisible();
      userEvent.click(getByText('GraphQL Task Filter'));
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({
        status: ['ASK_IN_FUTURE', 'CONTACT_FOR_APPOINTMENT'],
      });
      expect(getByText('Filter')).toBeVisible();
    });

    it('closes panel', async () => {
      const { queryByTestId, getByLabelText } = render(
        <GqlMockedProvider<SaveFilterMutation>>
          <FilterPanel
            filters={[]}
            savedFilters={[savedFiltersMock]}
            selectedFilters={{}}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </GqlMockedProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      userEvent.click(getByLabelText('Close'));
      expect(onClose).toHaveBeenCalled();
    });

    it('clears filters', async () => {
      const { getByText, queryByTestId, queryAllByTestId } = render(
        <MuiPickersUtilsProvider utils={LuxonUtils}>
          <GqlMockedProvider<SaveFilterMutation>>
            <FilterPanel
              filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
              savedFilters={[savedFiltersMock]}
              selectedFilters={{
                status: [ContactFilterStatusEnum.ContactForAppointment],
              }}
              onClose={onClose}
              onSelectedFiltersChanged={onSelectedFiltersChanged}
            />
          </GqlMockedProvider>
        </MuiPickersUtilsProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(queryAllByTestId('FilterGroup').length).toEqual(2);
      expect(getByText('Group 1 (1)')).toBeVisible();

      userEvent.click(getByText('Clear All'));
      expect(onSelectedFiltersChanged).toHaveBeenCalledWith({});
    });

    it('no filters', async () => {
      const { queryByTestId, queryAllByTestId } = render(
        <GqlMockedProvider<SaveFilterMutation>>
          <FilterPanel
            filters={[]}
            savedFilters={[]}
            selectedFilters={{}}
            onClose={onClose}
            onSelectedFiltersChanged={onSelectedFiltersChanged}
          />
        </GqlMockedProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryAllByTestId('FilterGroup').length).toEqual(0);
      expect(queryByTestId('FilterListItemShowAll')).toBeNull();
    });
  });
});
