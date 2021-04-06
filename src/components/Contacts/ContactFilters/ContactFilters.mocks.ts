import { GraphQLError } from 'graphql';

export const ContactFiltersDefaultMock = {
  contactFilters: [
    {
      title: 'Always Visible',
      alwaysVisible: true,
      filters: [{ type: 'text' }, { type: 'multiselect' }],
    },
    {
      title: 'Hidden',
      alwaysVisible: false,
      filters: [{ type: 'text' }],
    },
  ],
};

export const ContactFiltersEmptyMock = { contactFilters: [] };

export const ContactFiltersErrorMock = {
  contactFilters: new GraphQLError('GraphQL Error #42: Error loading Filters'),
};
