import { GraphQLError } from 'graphql';

export const ContactFiltersDefaultMock = {
  contactFilters: [
    {
      title: 'Always Visible',
      alwaysVisible: true,
      filters: [
        { title: 'Text Field', type: 'text' },
        { title: 'Date Range', type: 'daterange' },
        { title: 'Multiselect', type: 'multiselect' },
        { title: 'Multiselect', type: 'multiselect' },
        { title: 'Select', type: 'radio' },
      ],
    },
    {
      title: 'Hidden',
      alwaysVisible: false,
      filters: [{ type: 'text' }, { type: 'single_checkbox' }],
    },
  ],
};

export const ContactFiltersEmptyMock = { contactFilters: [] };

export const ContactFiltersErrorMock = {
  contactFilters: new GraphQLError('GraphQL Error #42: Error loading Filters'),
};
