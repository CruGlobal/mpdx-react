import { GraphQLError } from 'graphql';
import {
  CheckboxFilter,
  DaterangeFilter,
  MultiselectFilter,
} from '../../../../graphql/types.generated';

const mockDateRangeFilter: DaterangeFilter = {
  __typename: 'DaterangeFilter',
  featured: false,
  filterKey: 'daterange',
  title: 'Date Range',
  options: [],
};
const mockMultiselectFilter: MultiselectFilter = {
  __typename: 'MultiselectFilter',
  featured: true,
  filterKey: 'multiselect',
  title: 'MultiSelect',
};
const mockCheckboxFilter: CheckboxFilter = {
  __typename: 'CheckboxFilter',
  featured: false,
  filterKey: 'checkbox',
  title: 'Checkbox',
};

export const ContactFiltersDefaultMock = {
  accountList: {
    contactFilterGroups: [
      { name: 'Group 1', filters: [mockCheckboxFilter] },
      {
        name: 'Group 2',
        filters: [mockMultiselectFilter, mockDateRangeFilter],
      },
    ],
  },
};

export const ContactFiltersEmptyMock = {
  accountList: {
    contactFilterGroups: [],
  },
};

export const ContactFiltersErrorMock = {
  accountList: {
    contactFilterGroups: new GraphQLError(
      'GraphQL Error #42: Error loading Filters',
    ),
  },
};
