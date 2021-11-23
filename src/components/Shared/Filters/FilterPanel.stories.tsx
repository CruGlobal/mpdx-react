import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../__tests__/util/graphqlMocking';
import { FilterPanel } from './FilterPanel';
import {
  FilterPanelGroupFragment,
  FilterPanelGroupFragmentDoc,
  UserOptionFragment,
  UserOptionFragmentDoc,
} from './FilterPanel.generated';
import {
  mockDateRangeFilter,
  mockMultiselectFilterFeatured,
  mockMultiselectFilterNonFeatured,
  mockTextilter,
} from './FilterPanel.mocks';

export default {
  title: 'Shared/FilterPanel',
  args: { width: 290 },
};

const filterPanelDefaultMock = gqlMock<FilterPanelGroupFragment>(
  FilterPanelGroupFragmentDoc,
  {
    mocks: {
      name: 'Group 1',
      filters: [mockTextilter, mockMultiselectFilterNonFeatured],
    },
  },
);
const filterPanelFeaturedMock = gqlMock<FilterPanelGroupFragment>(
  FilterPanelGroupFragmentDoc,
  {
    mocks: {
      name: 'Group 2',
      filters: [mockMultiselectFilterFeatured, mockDateRangeFilter],
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

export const Default = ({ width }: { width: number }): ReactElement => (
  <Box width={width} height="100vh" bgcolor="#fff">
    <FilterPanel
      filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
      savedFilters={[savedFiltersMock]}
      selectedFilters={{}}
      width={width}
      onClose={() => {}}
      onSelectedFiltersChanged={() => {}}
    />
  </Box>
);

export const Empty = ({ width }: { width: number }): ReactElement => (
  <Box width={width} height="100vh" bgcolor="#fff">
    <FilterPanel
      filters={[]}
      savedFilters={[]}
      selectedFilters={{}}
      width={width}
      onClose={() => {}}
      onSelectedFiltersChanged={() => {}}
    />
  </Box>
);
