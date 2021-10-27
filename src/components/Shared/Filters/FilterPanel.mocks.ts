import { GraphQLError } from 'graphql';
import {
  DaterangeFilter,
  MultiselectFilter,
  TextFilter,
} from '../../../../graphql/types.generated';

const mockDateRangeFilter: DaterangeFilter = {
  __typename: 'DaterangeFilter',
  featured: false,
  filterKey: 'daterange',
  title: 'Date Range',
  options: [],
};
const mockMultiselectFilterNonFeatured: MultiselectFilter = {
  __typename: 'MultiselectFilter',
  featured: false,
  filterKey: 'multiselect',
  title: 'MultiSelect',
  options: [
    { name: 'Option3', value: 'option3' },
    { name: 'Option4', value: 'option4' },
  ],
};
const mockMultiselectFilterFeatured: MultiselectFilter = {
  __typename: 'MultiselectFilter',
  featured: true,
  filterKey: 'multiselect',
  title: 'MultiSelect',
  options: [
    { name: 'Option1', value: 'option1' },
    { name: 'Option2', value: 'option2' },
  ],
};
const mockTextilter: TextFilter = {
  __typename: 'TextFilter',
  featured: false,
  filterKey: 'text',
  title: 'Text',
  options: [],
};

export const FiltersDefaultMock = {
  accountList: {
    taskFilterGroups: [
      {
        name: 'Group 1 | Tasks',
        filters: [mockTextilter, mockMultiselectFilterNonFeatured],
      },
      {
        name: 'Group 2 | Tasks',
        filters: [mockMultiselectFilterFeatured, mockDateRangeFilter],
      },
    ],
    contactFilterGroups: [
      {
        name: 'Group 1 | Contacts',
        filters: [mockTextilter, mockMultiselectFilterNonFeatured],
      },
      {
        name: 'Group 2 | Contacts',
        filters: [mockMultiselectFilterFeatured, mockDateRangeFilter],
      },
    ],
  },
};

export const FiltersEmptyMock = {
  accountList: {
    taskFilterGroups: [],
    contactFilterGroups: [],
  },
};

export const FiltersErrorMock = {
  accountList: {
    taskFilterGroups: new GraphQLError(
      'GraphQL Error #42: Error loading Tasks Filters',
    ),
    contactFilterGroups: new GraphQLError(
      'GraphQL Error #42: Error loading Contacts Filters',
    ),
  },
};
