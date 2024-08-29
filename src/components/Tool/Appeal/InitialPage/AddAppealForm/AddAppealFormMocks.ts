import {
  ContactFiltersQuery,
  ContactTagsQuery,
} from './AddAppealForm.generated';

export const contactTagsMock: ContactTagsQuery = {
  accountList: {
    id: 'accountListId',
    contactTagList: ['tag-1', 'tag-2', 'tag-3', 'tag-4'],
  },
};

export const contactFiltersMock: ContactFiltersQuery = {
  accountList: {
    __typename: 'AccountList',
    id: 'accountListId',
    contactFilterGroups: [
      {
        __typename: 'FilterGroup',
        featured: false,
        name: 'Filter Group',
        filters: [
          {
            defaultSelection: '',
            filterKey: 'filterKey',
            title: 'title',
            options: [
              {
                name: 'name',
                placeholder: null,
                value: 'value',
                __typename: 'FilterOption',
              },
            ],
            __typename: 'MultiselectFilter',
          },
        ],
      },
      {
        __typename: 'FilterGroup',
        featured: true,
        name: 'Status',
        filters: [
          {
            defaultSelection: 'active, null',
            filterKey: 'status',
            title: 'Status',
            options: [
              {
                name: '--- All Active ---',
                placeholder: null,
                value: 'ACTIVE',
                __typename: 'FilterOption',
              },
              {
                name: 'New Connection',
                placeholder: null,
                value: 'NEVER_CONTACTED',
                __typename: 'FilterOption',
              },
              {
                name: 'Ask in Future',
                placeholder: null,
                value: 'ASK_IN_FUTURE',
                __typename: 'FilterOption',
              },
            ],
            __typename: 'MultiselectFilter',
          },
        ],
      },
    ],
  },
};
