import {
  DaterangeFilter,
  MultiselectFilter,
  TextFilter,
} from '../../../../graphql/types.generated';

export const mockDateRangeFilter: DaterangeFilter = {
  __typename: 'DaterangeFilter',
  featured: false,
  filterKey: 'daterange',
  title: 'Date Range',
  options: [],
};
export const mockMultiselectFilterNonFeatured: MultiselectFilter = {
  __typename: 'MultiselectFilter',
  featured: false,
  filterKey: 'multiselect',
  title: 'MultiSelect',
  options: [
    { name: 'Option3', value: 'option3' },
    { name: 'Option4', value: 'option4' },
  ],
};
export const mockMultiselectFilterFeatured: MultiselectFilter = {
  __typename: 'MultiselectFilter',
  featured: true,
  filterKey: 'multiselect',
  title: 'MultiSelect',
  options: [
    { name: 'Option1', value: 'option1' },
    { name: 'Option2', value: 'option2' },
  ],
};
export const mockTextilter: TextFilter = {
  __typename: 'TextFilter',
  featured: false,
  filterKey: 'text',
  title: 'Text',
  options: [],
};
