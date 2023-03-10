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
import { ContactFilterStatusEnum } from '../../../../graphql/types.generated';
import {
  mockDateRangeFilter,
  mockMultiselectFilter,
  mockTextFilter,
  mockSliderFilter,
} from './FilterPanel.mocks';
import { FilterPanel } from './FilterPanel';
import {
  FilterPanelGroupFragment,
  FilterPanelGroupFragmentDoc,
  UserOptionFragment,
  UserOptionFragmentDoc,
} from './FilterPanel.generated';
import { SaveFilterMutation } from './SaveFilterModal/SaveFilterModal.generated';
import theme from 'src/theme';

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
const filterPanelSlidersMock = gqlMock<FilterPanelGroupFragment>(
  FilterPanelGroupFragmentDoc,
  {
    mocks: {
      name: 'Group 3',
      featured: false,
      filters: [mockSliderFilter],
    },
  },
);

const savedFiltersMock = gqlMock<UserOptionFragment>(UserOptionFragmentDoc, {
  mocks: {
    id: '123',
    key: 'saved_contacts_filter_My_Cool_Filter',
    value:
      '{"any_tags":false,"account_list_id":"08bb09d1-3b62-4690-9596-b625b8af4750","params":{"status":"active,hidden,null,Never Contacted,Ask in Future,Cultivate Relationship,Contact for Appointment,Appointment Scheduled,Call for Decision,Partner - Financial,Partner - Special,Partner - Pray,Not Interested,Unresponsive,Never Ask,Research Abandoned,Expired Referral", "completed":"true", "overdue": "true", "primaryAddress": "primary, null", "reverseActivityType": "true", "reverseContactAppeal": "true", "reverseContactChurch": "true", "reverseContactCity": "true", "reverseContactCountry": "true", "reverseContactDesignationAccountId": "true", "reverseContactIds": "true", "reverseContactLikely": "true", "reverseContactMetroArea": "true", "reverseContactPledgeFrequency": "true", "reverseContactReferrer": "true", "reverseContactRegion": "true", "reverseContactState": "true", "reverseContactStatus": "true", "reverseContactTimezone": "true", "reverseContactType": "true", "reverseNextAction": "true", "reverseResult": "true", "reverseTags": "true", "reverseUserIds": "true", "contactChurch": "test1, test2", "contactCity": "test1", "contactCountry": "test1, test2", "contactDesignationAccountId": "test1, test2", "contactLikely": "test1, test2", "contactMetroArea": "test1, test2", "contactPledgeFrequency": "test1, test2", "contactReferrer": "test1, test2", "contactRegion": "test1, test2", "contactState": "test1", "contactTimezone": "test1, test2", "reverse_alma_mater": "false","contactNewsletter":"all","notes":{"wildcard_note_search": "note1"}, "activity_type": "Appointment,Call,Email,Facebook Message,Prayer Request,Talk to In Person,Text Message,Thank,None,Letter,Newsletter - Physical,Newsletter - Email,Pre Call Letter,Reminder Letter,Support Letter,To Do", "next_action": "Appointment,Call,Email,Facebook Message,Prayer Request,Talk to In Person,Text Message,Thank,None", "result": "Attempted,Attempted - Left Message,Completed,Done,None,Received", "pledge_received":"true","pledge_amount":"35.0,40.0","pledge_currency":"USD","pledge_frequency":"0.46153846153846,1.0","pledge_late_by":"30_60","newsletter":"no_value","referrer":"d5b1dab5-e3ae-417d-8f49-2abdd915515b","city":"Evansville,Woodstock","state":"FL","country":"United States","metro_area":"Cool","region":"Orange County","contact_info_email":"Yes","contact_info_phone":"No","contact_info_mobile":"No","contact_info_work_phone":"No","contact_info_addr":"Yes","contact_info_facebook":"No","opt_out":"No","church":"Cool Church II","appeal":"851769ba-b55d-45f3-b784-c4eca7ae99fd,77491693-df83-46ec-b40b-39d07333f47e","timezone":"America/Vancouver","locale":"English","donation":"first","donation_date":"2021-12-23..2021-12-23","next_ask":"2021-11-30..2021-12-22","user_ids":"787f286e-fe38-4055-b9fc-0177a0f55947","reverse_appeal":true,"contact_types": "person"},"tags":null,"exclude_tags":null,"wildcard_search":""}',
  },
});

const savedFiltersMockTwo = gqlMock<UserOptionFragment>(UserOptionFragmentDoc, {
  mocks: {
    id: '123',
    key: 'saved_contacts_filter_My_Cool_Filter',
    value:
      '{"any_tags":false,"account_list_id":"08bb09d1-3b62-4690-9596-b625b8af4750","params":{"pledgeReceived": "false", "addressHistoric": "true", "addressValid": "true", "almaMater": "test1,test2", "newsletter": "email", "contactNewsletter": "email_only", "status": "--any--", "activityType": "--any--", "nextAction": "--any--", "result": "--any--"},"tags":null,"exclude_tags":null,"wildcard_search":""}',
  },
});

const savedFiltersMockThree = gqlMock<UserOptionFragment>(
  UserOptionFragmentDoc,
  {
    mocks: {
      id: '123',
      key: 'saved_contacts_filter_My_Cool_Filter',
      value:
        '{"any_tags":false,"account_list_id":"08bb09d1-3b62-4690-9596-b625b8af4750","params":{"pledgeReceived": "default", "addressLatLng": "test1", "appealStatus": "test1", "contactAppeal": "test1", "newsletter": "none", "contactNewsletter": "physical", "donation_amount_range": {"min": "0", "max": "2000.45"}},"tags":null,"exclude_tags":null,"wildcard_search":""}',
    },
  },
);

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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useRouter = jest.spyOn(require('next/router'), 'useRouter');

describe('FilterPanel', () => {
  describe('Contacts', () => {
    beforeEach(() => {
      useRouter.mockReturnValue({
        route: '/contacts',
      });
    });
    it('default', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<SaveFilterMutation>>
                <FilterPanel
                  filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                  savedFilters={[savedFiltersMock]}
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>,
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
        getByRole,
      } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<SaveFilterMutation>>
              <FilterPanel
                filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                savedFilters={[savedFiltersMock]}
                selectedFilters={{}}
                onClose={onClose}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
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
    });

    it('should display a selected filter', async () => {
      const {
        getByTestId,
        getByText,
        getAllByText,
        queryByTestId,
        getAllByTestId,
      } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
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
          </ThemeProvider>
        </LocalizationProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(getAllByTestId('FilterGroup').length).toEqual(2);
      userEvent.click(getByText('Group 1 (1)'));
      expect(
        getAllByText(filterPanelDefaultMock.filters[0].title),
      ).toHaveLength(2);
      expect(
        getAllByText(filterPanelDefaultMock.filters[1].title),
      ).toHaveLength(3);
      expect(getByTestId('multiSelectFilter')).toBeInTheDocument();
      expect(getByText('Group 1 (1)')).toBeVisible();
    });

    it('opens and selects a saved filter', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<SaveFilterMutation>>
                <FilterPanel
                  filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                  savedFilters={[savedFiltersMock, savedGraphQLContactMock]}
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>,
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
        church: 'Cool Church II',
        city: ['Evansville', 'Woodstock'],
        contactInfoAddr: 'Yes',
        contactInfoEmail: 'Yes',
        contactInfoFacebook: 'No',
        contactInfoMobile: 'No',
        contactInfoPhone: 'No',
        contactInfoWorkPhone: 'No',
        contactChurch: ['test1', ' test2'],
        contactCity: 'test1',
        contactCountry: ['test1', ' test2'],
        contactDesignationAccountId: ['test1', ' test2'],
        contactLikely: ['test1', ' test2'],
        contactMetroArea: ['test1', ' test2'],
        contactPledgeFrequency: ['test1', ' test2'],
        contactReferrer: ['test1', ' test2'],
        contactRegion: ['test1', ' test2'],
        contactState: 'test1',
        contactTimezone: ['test1', ' test2'],
        completed: true,
        country: 'United States',
        donation: 'first',
        donationDate: {
          max: '2021-12-23',
          min: '2021-12-23',
        },
        excludeTags: null,
        locale: 'English',
        metroArea: 'Cool',
        newsletter: 'NO_VALUE',
        contactNewsletter: 'ALL',
        nextAsk: {
          max: '2021-12-22',
          min: '2021-11-30',
        },
        notes: 'note1',
        optOut: 'No',
        overdue: true,
        pledgeAmount: ['35.0', '40.0'],
        pledgeCurrency: 'USD',
        pledgeFrequency: ['0.46153846153846', '1.0'],
        pledgeLateBy: '30_60',
        pledgeReceived: 'RECEIVED',
        primaryAddress: 'primary, null',
        referrer: 'd5b1dab5-e3ae-417d-8f49-2abdd915515b',
        region: 'Orange County',
        reverseActivityType: true,
        reverseContactAppeal: true,
        reverseContactChurch: true,
        reverseContactCity: true,
        reverseContactCountry: true,
        reverseContactDesignationAccountId: true,
        reverseContactIds: true,
        reverseContactLikely: true,
        reverseContactMetroArea: true,
        reverseContactPledgeFrequency: true,
        reverseContactReferrer: true,
        reverseContactRegion: true,
        reverseContactState: true,
        reverseContactStatus: true,
        reverseContactTimezone: true,
        reverseContactType: true,
        reverseNextAction: true,
        reverseResult: true,
        reverseTags: true,
        reverseUserIds: true,
        reverseAlmaMater: false,
        reverseAppeal: false,
        state: 'FL',
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
        activityType: [
          'APPOINTMENT',
          'CALL',
          'EMAIL',
          'FACEBOOK_MESSAGE',
          'PRAYER_REQUEST',
          'TALK_TO_IN_PERSON',
          'TEXT_MESSAGE',
          'THANK',
          'NONE',
          'LETTER',
          'NEWSLETTER_PHYSICAL',
          'NEWSLETTER_EMAIL',
          'PRE_CALL_LETTER',
          'REMINDER_LETTER',
          'SUPPORT_LETTER',
          'TO_DO',
        ],
        nextAction: [
          'APPOINTMENT',
          'CALL',
          'EMAIL',
          'FACEBOOK_MESSAGE',
          'PRAYER_REQUEST',
          'TALK_TO_IN_PERSON',
          'TEXT_MESSAGE',
          'THANK',
          'NONE',
        ],
        result: [
          'ATTEMPTED',
          'ATTEMPTED_LEFT_MESSAGE',
          'COMPLETED',
          'DONE',
          'NONE',
          'RECEIVED',
        ],
        tags: null,
        timezone: 'America/Vancouver',
        userIds: '787f286e-fe38-4055-b9fc-0177a0f55947',
        wildcardSearch: '',
      });
      expect(getByText('Filter')).toBeVisible();
    });

    it('opens and selects a saved filter Two', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<SaveFilterMutation>>
                <FilterPanel
                  filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                  savedFilters={[savedFiltersMockTwo, savedGraphQLContactMock]}
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>,
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
        excludeTags: null,
        addressHistoric: true,
        addressValid: true,
        almaMater: ['test1', 'test2'],
        newsletter: 'EMAIL',
        contactNewsletter: 'EMAIL_ONLY',
        status: [
          'ACTIVE',
          'APPOINTMENT_SCHEDULED',
          'ASK_IN_FUTURE',
          'CALL_FOR_DECISION',
          'CONTACT_FOR_APPOINTMENT',
          'CULTIVATE_RELATIONSHIP',
          'EXPIRED_REFERRAL',
          'HIDDEN',
          'NEVER_ASK',
          'NEVER_CONTACTED',
          'NOT_INTERESTED',
          'NULL',
          'PARTNER_FINANCIAL',
          'PARTNER_PRAY',
          'PARTNER_SPECIAL',
          'RESEARCH_ABANDONED',
          'UNRESPONSIVE',
        ],
        activityType: [
          'APPOINTMENT',
          'CALL',
          'EMAIL',
          'FACEBOOK_MESSAGE',
          'LETTER',
          'NEWSLETTER_EMAIL',
          'NEWSLETTER_PHYSICAL',
          'NONE',
          'PRAYER_REQUEST',
          'PRE_CALL_LETTER',
          'REMINDER_LETTER',
          'SUPPORT_LETTER',
          'TALK_TO_IN_PERSON',
          'TEXT_MESSAGE',
          'THANK',
          'TO_DO',
        ],
        nextAction: [
          'APPOINTMENT',
          'CALL',
          'EMAIL',
          'FACEBOOK_MESSAGE',
          'PRAYER_REQUEST',
          'TALK_TO_IN_PERSON',
          'TEXT_MESSAGE',
          'THANK',
          'NONE',
        ],
        result: [
          'ATTEMPTED',
          'ATTEMPTED_LEFT_MESSAGE',
          'COMPLETED',
          'DONE',
          'NONE',
          'RECEIVED',
        ],
        pledgeReceived: 'NOT_RECEIVED',
        tags: null,
        wildcardSearch: '',
      });
      expect(getByText('Filter')).toBeVisible();
    });

    it('opens and selects a saved filter Three', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<SaveFilterMutation>>
                <FilterPanel
                  filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                  savedFilters={[
                    savedFiltersMockThree,
                    savedGraphQLContactMock,
                  ]}
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>,
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
        excludeTags: null,
        addressLatLng: 'test1',
        appealStatus: 'test1',
        contactAppeal: 'test1',
        donationAmountRange: {
          min: 0,
          max: 2000.45,
        },
        newsletter: 'NONE',
        contactNewsletter: 'PHYSICAL',
        pledgeReceived: 'ANY',
        tags: null,
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
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
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
          </ThemeProvider>
        </LocalizationProvider>,
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

  describe('Report Contacts', () => {
    beforeEach(() => {
      useRouter.mockReturnValue({
        route: '/reports/partnerGivingAnalysis',
      });
    });

    it('default', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<SaveFilterMutation>>
                <FilterPanel
                  filters={[
                    filterPanelDefaultMock,
                    filterPanelFeaturedMock,
                    filterPanelSlidersMock,
                  ]}
                  savedFilters={[savedFiltersMock]}
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>,
        );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();
      expect(queryAllByTestId('FilterGroup')).toHaveLength(3);
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

    it('should automatically expand accordions', async () => {
      const { getByTestId, queryByTestId, getAllByTestId } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<SaveFilterMutation>>
              <FilterPanel
                filters={[
                  filterPanelDefaultMock,
                  filterPanelFeaturedMock,
                  filterPanelSlidersMock,
                ]}
                defaultExpandedFilterGroups={new Set(['Group 3'])}
                savedFilters={[savedFiltersMock]}
                selectedFilters={{
                  status: [ContactFilterStatusEnum.ContactForAppointment],
                }}
                onClose={onClose}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
            </GqlMockedProvider>
          </ThemeProvider>
        </LocalizationProvider>,
      );

      await waitFor(() => expect(queryByTestId('LoadingState')).toBeNull());
      expect(queryByTestId('LoadingState')).toBeNull();
      expect(queryByTestId('ErrorState')).toBeNull();

      expect(getAllByTestId('FilterGroup')).toHaveLength(3);
      expect(getByTestId('sliderFilter')).toBeInTheDocument();
      expect(queryByTestId('multiSelectFilter')).not.toBeInTheDocument();
    });
  });

  describe('Tasks', () => {
    beforeEach(() => {
      useRouter.mockReturnValue({
        route: '/tasks',
      });
    });
    it('default', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<SaveFilterMutation>>
                <FilterPanel
                  filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                  savedFilters={[savedFiltersMock]}
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>,
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
        getByRole,
      } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
            <GqlMockedProvider<SaveFilterMutation>>
              <FilterPanel
                filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                savedFilters={[savedFiltersMock]}
                selectedFilters={{}}
                onClose={onClose}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
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
    });

    it('opens and selects a saved filter', async () => {
      const { getByTestId, getByText, queryByTestId, queryAllByTestId } =
        render(
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeProvider theme={theme}>
              <GqlMockedProvider<SaveFilterMutation>>
                <FilterPanel
                  filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
                  savedFilters={[savedGraphQLTaskMock]}
                  selectedFilters={{}}
                  onClose={onClose}
                  onSelectedFiltersChanged={onSelectedFiltersChanged}
                />
              </GqlMockedProvider>
            </ThemeProvider>
          </LocalizationProvider>,
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
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <ThemeProvider theme={theme}>
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
          </ThemeProvider>
        </LocalizationProvider>,
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
