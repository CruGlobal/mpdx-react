import * as Types from '../../../../src/graphql/types.generated';

import { gql } from '@apollo/client';
import { ContactRowFragmentDoc } from '../../../../src/components/Contacts/ContactRow/ContactRow.generated';
import {
  FilterPanelGroupFragmentDoc,
  UserOptionFragmentDoc,
} from '../../../../src/components/Shared/Filters/FilterPanel.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ContactsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactsFilters?: Types.InputMaybe<Types.ContactFilterSetInput>;
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type ContactsQuery = { __typename?: 'Query' } & {
  contacts: { __typename?: 'ContactConnection' } & Pick<
    Types.ContactConnection,
    'totalCount'
  > & {
      nodes: Array<
        { __typename?: 'Contact' } & Pick<
          Types.Contact,
          | 'id'
          | 'avatar'
          | 'name'
          | 'status'
          | 'pledgeAmount'
          | 'pledgeFrequency'
          | 'pledgeCurrency'
          | 'pledgeReceived'
          | 'lateAt'
          | 'sendNewsletter'
          | 'starred'
          | 'uncompletedTasksCount'
        > & {
            primaryAddress?: Types.Maybe<
              { __typename?: 'Address' } & Pick<
                Types.Address,
                | 'id'
                | 'street'
                | 'city'
                | 'state'
                | 'postalCode'
                | 'country'
                | 'geo'
                | 'source'
                | 'createdAt'
              >
            >;
            people: { __typename?: 'PersonConnection' } & {
              nodes: Array<
                { __typename?: 'Person' } & Pick<
                  Types.Person,
                  | 'anniversaryMonth'
                  | 'anniversaryDay'
                  | 'birthdayDay'
                  | 'birthdayMonth'
                >
              >;
            };
          }
      >;
      pageInfo: { __typename?: 'PageInfo' } & Pick<
        Types.PageInfo,
        'endCursor' | 'hasNextPage'
      >;
    };
  allContacts: { __typename?: 'ContactConnection' } & Pick<
    Types.ContactConnection,
    'totalCount'
  >;
};

export type ContactFiltersQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type ContactFiltersQuery = { __typename?: 'Query' } & {
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    'id'
  > & {
      contactFilterGroups: Array<
        { __typename?: 'FilterGroup' } & Pick<
          Types.FilterGroup,
          'name' | 'featured'
        > & {
            filters: Array<
              | ({ __typename: 'CheckboxFilter' } & Pick<
                  Types.CheckboxFilter,
                  'filterKey' | 'title'
                >)
              | ({ __typename: 'DaterangeFilter' } & Pick<
                  Types.DaterangeFilter,
                  'filterKey' | 'title'
                > & {
                    options?: Types.Maybe<
                      Array<
                        { __typename?: 'DateRangeOption' } & Pick<
                          Types.DateRangeOption,
                          'name' | 'rangeEnd' | 'rangeStart'
                        >
                      >
                    >;
                  })
              | ({ __typename: 'MultiselectFilter' } & Pick<
                  Types.MultiselectFilter,
                  'defaultSelection' | 'filterKey' | 'title'
                > & {
                    options?: Types.Maybe<
                      Array<
                        { __typename?: 'FilterOption' } & Pick<
                          Types.FilterOption,
                          'name' | 'placeholder' | 'value'
                        >
                      >
                    >;
                  })
              | ({ __typename: 'NumericRangeFilter' } & Pick<
                  Types.NumericRangeFilter,
                  | 'min'
                  | 'minLabel'
                  | 'max'
                  | 'maxLabel'
                  | 'title'
                  | 'filterKey'
                >)
              | ({ __typename: 'RadioFilter' } & Pick<
                  Types.RadioFilter,
                  'defaultSelection' | 'filterKey' | 'title'
                > & {
                    options?: Types.Maybe<
                      Array<
                        { __typename?: 'FilterOption' } & Pick<
                          Types.FilterOption,
                          'name' | 'placeholder' | 'value'
                        >
                      >
                    >;
                  })
              | ({ __typename: 'TextFilter' } & Pick<
                  Types.TextFilter,
                  'filterKey' | 'title'
                > & {
                    options?: Types.Maybe<
                      Array<
                        { __typename?: 'FilterOption' } & Pick<
                          Types.FilterOption,
                          'name' | 'placeholder' | 'value'
                        >
                      >
                    >;
                  })
            >;
          }
      >;
      partnerGivingAnalysisFilterGroups: Array<
        { __typename?: 'FilterGroup' } & Pick<
          Types.FilterGroup,
          'name' | 'featured'
        > & {
            filters: Array<
              | ({ __typename: 'CheckboxFilter' } & Pick<
                  Types.CheckboxFilter,
                  'filterKey' | 'title'
                >)
              | ({ __typename: 'DaterangeFilter' } & Pick<
                  Types.DaterangeFilter,
                  'filterKey' | 'title'
                > & {
                    options?: Types.Maybe<
                      Array<
                        { __typename?: 'DateRangeOption' } & Pick<
                          Types.DateRangeOption,
                          'name' | 'rangeEnd' | 'rangeStart'
                        >
                      >
                    >;
                  })
              | ({ __typename: 'MultiselectFilter' } & Pick<
                  Types.MultiselectFilter,
                  'defaultSelection' | 'filterKey' | 'title'
                > & {
                    options?: Types.Maybe<
                      Array<
                        { __typename?: 'FilterOption' } & Pick<
                          Types.FilterOption,
                          'name' | 'placeholder' | 'value'
                        >
                      >
                    >;
                  })
              | ({ __typename: 'NumericRangeFilter' } & Pick<
                  Types.NumericRangeFilter,
                  | 'min'
                  | 'minLabel'
                  | 'max'
                  | 'maxLabel'
                  | 'title'
                  | 'filterKey'
                >)
              | ({ __typename: 'RadioFilter' } & Pick<
                  Types.RadioFilter,
                  'defaultSelection' | 'filterKey' | 'title'
                > & {
                    options?: Types.Maybe<
                      Array<
                        { __typename?: 'FilterOption' } & Pick<
                          Types.FilterOption,
                          'name' | 'placeholder' | 'value'
                        >
                      >
                    >;
                  })
              | ({ __typename: 'TextFilter' } & Pick<
                  Types.TextFilter,
                  'filterKey' | 'title'
                > & {
                    options?: Types.Maybe<
                      Array<
                        { __typename?: 'FilterOption' } & Pick<
                          Types.FilterOption,
                          'name' | 'placeholder' | 'value'
                        >
                      >
                    >;
                  })
            >;
          }
      >;
    };
  userOptions: Array<
    { __typename?: 'Option' } & Pick<Types.Option, 'id' | 'key' | 'value'>
  >;
};

export const ContactsDocument = gql`
  query Contacts(
    $accountListId: ID!
    $contactsFilters: ContactFilterSetInput
    $after: String
    $first: Int
  ) {
    contacts(
      accountListId: $accountListId
      contactsFilter: $contactsFilters
      after: $after
      first: $first
    ) {
      nodes {
        id
        avatar
        ...ContactRow
      }
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
    }
    allContacts: contacts(accountListId: $accountListId, after: $after) {
      totalCount
    }
  }
  ${ContactRowFragmentDoc}
`;
export function useContactsQuery(
  baseOptions: Apollo.QueryHookOptions<ContactsQuery, ContactsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ContactsQuery, ContactsQueryVariables>(
    ContactsDocument,
    options,
  );
}
export function useContactsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ContactsQuery,
    ContactsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ContactsQuery, ContactsQueryVariables>(
    ContactsDocument,
    options,
  );
}
export type ContactsQueryHookResult = ReturnType<typeof useContactsQuery>;
export type ContactsLazyQueryHookResult = ReturnType<
  typeof useContactsLazyQuery
>;
export type ContactsQueryResult = Apollo.QueryResult<
  ContactsQuery,
  ContactsQueryVariables
>;
export const ContactFiltersDocument = gql`
  query ContactFilters($accountListId: ID!) {
    accountList(id: $accountListId) {
      id
      contactFilterGroups {
        ...FilterPanelGroup
      }
      partnerGivingAnalysisFilterGroups {
        ...FilterPanelGroup
      }
    }
    userOptions {
      ...UserOption
    }
  }
  ${FilterPanelGroupFragmentDoc}
  ${UserOptionFragmentDoc}
`;
export function useContactFiltersQuery(
  baseOptions: Apollo.QueryHookOptions<
    ContactFiltersQuery,
    ContactFiltersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ContactFiltersQuery, ContactFiltersQueryVariables>(
    ContactFiltersDocument,
    options,
  );
}
export function useContactFiltersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ContactFiltersQuery,
    ContactFiltersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ContactFiltersQuery, ContactFiltersQueryVariables>(
    ContactFiltersDocument,
    options,
  );
}
export type ContactFiltersQueryHookResult = ReturnType<
  typeof useContactFiltersQuery
>;
export type ContactFiltersLazyQueryHookResult = ReturnType<
  typeof useContactFiltersLazyQuery
>;
export type ContactFiltersQueryResult = Apollo.QueryResult<
  ContactFiltersQuery,
  ContactFiltersQueryVariables
>;
