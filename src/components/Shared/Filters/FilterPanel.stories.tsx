import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../__tests__/util/graphqlMocking';
import { FilterPanel } from './FilterPanel';
import {
  FilterPanelGroupFragment,
  FilterPanelGroupFragmentDoc,
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

export const Default = ({ width }: { width: number }): ReactElement => (
  <Box width={width} height="100vh" bgcolor="#fff">
    <FilterPanel
      filters={[filterPanelDefaultMock, filterPanelFeaturedMock]}
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
      width={width}
      onClose={() => {}}
      onSelectedFiltersChanged={() => {}}
    />
  </Box>
);
