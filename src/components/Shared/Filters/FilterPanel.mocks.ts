import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  ContactFilterStatusEnum,
  DaterangeFilter,
  MultiselectFilter,
  NumericRangeFilter,
  TextFilter,
} from 'src/graphql/types.generated';
import {
  FilterPanelGroupFragment,
  FilterPanelGroupFragmentDoc,
  UserOptionFragment,
  UserOptionFragmentDoc,
} from './FilterPanel.generated';

export const mockDateRangeFilter: DaterangeFilter = {
  __typename: 'DaterangeFilter',
  filterKey: 'daterange',
  title: 'Date Range',
  options: [],
};
export const mockMultiselectFilter: MultiselectFilter = {
  __typename: 'MultiselectFilter',
  filterKey: 'status',
  title: 'Status',
  options: [
    {
      name: 'Contact for Appointment',
      value: ContactFilterStatusEnum.ContactForAppointment,
    },
    {
      name: 'Appointment Scheduled',
      value: ContactFilterStatusEnum.AppointmentScheduled,
    },
  ],
};
export const mockReferrerMultiSelectFilter: MultiselectFilter = {
  __typename: 'MultiselectFilter',
  filterKey: 'referrer',
  title: 'Referrer',
  options: [
    {
      name: 'John',
      value: '1234',
    },
  ],
};

export const mockTextFilter: TextFilter = {
  __typename: 'TextFilter',
  filterKey: 'text',
  title: 'Text',
  options: [],
};

export const mockSliderFilter: NumericRangeFilter = {
  __typename: 'NumericRangeFilter',
  filterKey: 'donation_period_amount',
  title: 'Donation Amount',
  min: 10,
  max: 100,
  minLabel: 'Min',
  maxLabel: 'Max',
};

export const mockTagsFilter: MultiselectFilter = {
  __typename: 'MultiselectFilter',
  filterKey: 'tags',
  title: 'Tags',
  options: [
    { name: 'Any', value: '--any--' },
    { name: 'Tag 1', value: 'tag-1' },
    { name: 'Tag 2', value: 'tag-2' },
    { name: 'Tag 3', value: 'tag-3' },
  ],
};

export const mockNoteSearchFilter: TextFilter = {
  __typename: 'TextFilter',
  filterKey: 'notes',
  title: 'Notes',
  options: [
    {
      __typename: 'FilterOption',
      name: 'notes',
      placeholder: 'Notes',
      value: 'test',
    },
  ],
};

export const filterPanelDefaultMock = gqlMock<FilterPanelGroupFragment>(
  FilterPanelGroupFragmentDoc,
  {
    mocks: {
      name: 'Group 1',
      featured: false,
      filters: [mockTextFilter, mockMultiselectFilter],
    },
  },
);
export const filterPanelFeaturedMock = gqlMock<FilterPanelGroupFragment>(
  FilterPanelGroupFragmentDoc,
  {
    mocks: {
      name: 'Group 2',
      featured: true,
      filters: [mockMultiselectFilter, mockDateRangeFilter],
    },
  },
);
export const filterPanelSlidersMock = gqlMock<FilterPanelGroupFragment>(
  FilterPanelGroupFragmentDoc,
  {
    mocks: {
      name: 'Group 3',
      featured: false,
      filters: [mockSliderFilter],
    },
  },
);
export const filterPanelTagsMock = gqlMock<FilterPanelGroupFragment>(
  FilterPanelGroupFragmentDoc,
  {
    mocks: {
      name: 'Tags',
      featured: false,
      filters: [mockTagsFilter],
    },
  },
);

export const filterPanelNoteSearchMock = gqlMock<FilterPanelGroupFragment>(
  FilterPanelGroupFragmentDoc,
  {
    mocks: {
      name: 'Search Notes',
      featured: false,
      filters: [mockNoteSearchFilter],
    },
  },
);
export const filterPanelRenameMock = gqlMock<FilterPanelGroupFragment>(
  FilterPanelGroupFragmentDoc,
  {
    mocks: {
      name: 'Referrer',
      featured: false,
      filters: [mockTextFilter, mockReferrerMultiSelectFilter],
    },
  },
);

export const savedFiltersMock = gqlMock<UserOptionFragment>(
  UserOptionFragmentDoc,
  {
    mocks: {
      id: '123',
      key: 'saved_contacts_filter_My_Cool_Filter',
      value:
        '{"any_tags":false,"account_list_id":"08bb09d1-3b62-4690-9596-b625b8af4750","params":{"status":"never_contacted,ACTIVE,HIDDEN,NULL,partner_financial,Appointment Scheduled", "completed":"true", "overdue": "true", "primaryAddress": "primary, null", "reverseActivityType": "true", "reverseContactAppeal": "true", "reverseContactChurch": "true", "reverseContactCity": "true", "reverseContactCountry": "true", "reverseContactDesignationAccountId": "true", "reverseContactIds": "true", "reverseContactLikely": "true", "reverseContactMetroArea": "true", "reverseContactPledgeFrequency": "true", "reverseContactReferrer": "true", "reverseContactRegion": "true", "reverseContactState": "true", "reverseContactStatus": "true", "reverseContactTimezone": "true", "reverseContactType": "true", "reverseNextAction": "true", "reverseResult": "true", "reverseTags": "true", "reverseUserIds": "true", "contactChurch": "test1, test2", "contactCity": "test1", "contactCountry": "test1, test2", "contactDesignationAccountId": "test1, test2", "contactLikely": "test1, test2", "contactMetroArea": "test1, test2", "contactPledgeFrequency": "test1, test2", "contactReferrer": "test1, test2", "contactRegion": "test1, test2", "contactState": "test1", "contactTimezone": "test1, test2", "reverse_alma_mater": "false","contactNewsletter":"all","notes":{"wildcardNoteSearch": "note1"}, "activity_type": "appointment_in_person,Partner Care - Social Media Message", "result": "Attempted,Attempted - Left Message,Completed,Done,None,Received", "pledge_received":"true","pledge_amount":"35.0,40.0","pledge_currency":"USD","pledge_frequency":"0.46153846153846,1.0","pledge_late_by":"30_60","newsletter":"no_value","referrer":"d5b1dab5-e3ae-417d-8f49-2abdd915515b","city":"Evansville,Woodstock","state":"FL","country":"United States","metro_area":"Cool","region":"Orange County","contact_info_email":"Yes","contact_info_phone":"No","contact_info_mobile":"No","contact_info_work_phone":"No","contact_info_addr":"Yes","contact_info_facebook":"No","opt_out":"No","church":"Cool Church II","appeal":"851769ba-b55d-45f3-b784-c4eca7ae99fd,77491693-df83-46ec-b40b-39d07333f47e","timezone":"America/Vancouver","locale":"English","donation":"first","donation_date":"2021-12-23..2021-12-23","next_ask":"2021-11-30..2021-12-22","user_ids":"787f286e-fe38-4055-b9fc-0177a0f55947","reverse_appeal":true,"contact_types": "person"},"tags":null,"exclude_tags":null,"wildcard_search":""}',
    },
  },
);

export const savedFiltersMockTwo = gqlMock<UserOptionFragment>(
  UserOptionFragmentDoc,
  {
    mocks: {
      id: '123',
      key: 'saved_contacts_filter_My_Cool_Filter',
      value:
        '{"any_tags":false,"account_list_id":"08bb09d1-3b62-4690-9596-b625b8af4750","params":{"pledgeReceived": "false", "addressHistoric": "true", "addressValid": "true", "almaMater": "test1,test2", "newsletter": "email", "contactNewsletter": "email_only", "status": "--any--", "activityType": "--any--", "nextAction": "--any--", "result": "--any--"},"tags":null,"exclude_tags":null,"wildcard_search":""}',
    },
  },
);

export const savedFiltersMockThree = gqlMock<UserOptionFragment>(
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

export const noteSearchSavedFilterMock = gqlMock<UserOptionFragment>(
  UserOptionFragmentDoc,
  {
    mocks: {
      id: '123',
      key: 'saved_contacts_filter_note_search',
      value:
        '{"any_tags":false,"account_list_id":"08bb09d1-3b62-4690-9596-b625b8af4750","params":{"notes": {"wildcard_note_search": "test note search"}},"tags":null,"exclude_tags":null,"wildcard_search":""}',
    },
  },
);

export const noteSearchSavedGraphQLFilterMock = gqlMock<UserOptionFragment>(
  UserOptionFragmentDoc,
  {
    mocks: {
      id: '123',
      key: 'graphql_saved_contacts_filter_note_search',
      value:
        '{"notes": {"wildcardNoteSearch": "test"}, "accountListId":"08bb09d1-3b62-4690-9596-b625b8af4750"}',
    },
  },
);

export const savedGraphQLContactMock = gqlMock<UserOptionFragment>(
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

export const savedGraphQLTaskMock = gqlMock<UserOptionFragment>(
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
