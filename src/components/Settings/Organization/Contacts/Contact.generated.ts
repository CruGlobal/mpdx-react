import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeleteOrganizationContactMutationVariables = Types.Exact<{
  input: Types.DeleteOrganizationContactInput;
}>;

export type DeleteOrganizationContactMutation = { __typename?: 'Mutation' } & {
  deleteOrganizationContact: { __typename?: 'DeletionResponse' } & Pick<
    Types.DeletionResponse,
    'success'
  >;
};

export type SearchOrganizationsContactsQueryVariables = Types.Exact<{
  input: Types.SearchOrganizationsContactsInput;
}>;

export type SearchOrganizationsContactsQuery = { __typename?: 'Query' } & {
  searchOrganizationsContacts: {
    __typename?: 'SearchOrganizationsContactsResponse';
  } & {
    contacts: Array<
      Types.Maybe<
        { __typename?: 'OrganizationsContact' } & Pick<
          Types.OrganizationsContact,
          'allowDeletion' | 'id' | 'name' | 'squareAvatar'
        > & {
            people: Array<
              Types.Maybe<
                { __typename?: 'ContactPeople' } & Pick<
                  Types.ContactPeople,
                  'firstName' | 'lastName' | 'deceased'
                > & {
                    emailAddresses?: Types.Maybe<
                      Array<
                        Types.Maybe<
                          { __typename?: 'ContactPeopleEmailAddresses' } & Pick<
                            Types.ContactPeopleEmailAddresses,
                            'email' | 'primary' | 'historic'
                          >
                        >
                      >
                    >;
                    phoneNumbers?: Types.Maybe<
                      Array<
                        Types.Maybe<
                          { __typename?: 'ContactPeoplePhoneNumbers' } & Pick<
                            Types.ContactPeoplePhoneNumbers,
                            'number' | 'primary' | 'historic'
                          >
                        >
                      >
                    >;
                  }
              >
            >;
            accountList?: Types.Maybe<
              { __typename?: 'ContactPeopleAccountLists' } & Pick<
                Types.ContactPeopleAccountLists,
                'name'
              > & {
                  accountListUsers?: Types.Maybe<
                    Array<
                      Types.Maybe<
                        {
                          __typename?: 'ContactPeopleAccountListsUsers';
                        } & Pick<
                          Types.ContactPeopleAccountListsUsers,
                          'id' | 'firstName' | 'lastName'
                        > & {
                            emailAddresses?: Types.Maybe<
                              Array<
                                Types.Maybe<
                                  {
                                    __typename?: 'ContactPeopleEmailAddresses';
                                  } & Pick<
                                    Types.ContactPeopleEmailAddresses,
                                    'email' | 'primary' | 'historic'
                                  >
                                >
                              >
                            >;
                          }
                      >
                    >
                  >;
                }
            >;
            addresses: Array<
              Types.Maybe<
                { __typename?: 'ContactAddresses' } & Pick<
                  Types.ContactAddresses,
                  | 'primaryMailingAddress'
                  | 'street'
                  | 'city'
                  | 'state'
                  | 'postalCode'
                >
              >
            >;
          }
      >
    >;
    pagination: { __typename?: 'Pagination' } & Pick<
      Types.Pagination,
      'page' | 'perPage' | 'totalCount' | 'totalPages'
    >;
  };
};

export const DeleteOrganizationContactDocument = gql`
  mutation DeleteOrganizationContact($input: DeleteOrganizationContactInput!) {
    deleteOrganizationContact(input: $input) {
      success
    }
  }
`;
export type DeleteOrganizationContactMutationFn = Apollo.MutationFunction<
  DeleteOrganizationContactMutation,
  DeleteOrganizationContactMutationVariables
>;
export function useDeleteOrganizationContactMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteOrganizationContactMutation,
    DeleteOrganizationContactMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteOrganizationContactMutation,
    DeleteOrganizationContactMutationVariables
  >(DeleteOrganizationContactDocument, options);
}
export type DeleteOrganizationContactMutationHookResult = ReturnType<
  typeof useDeleteOrganizationContactMutation
>;
export type DeleteOrganizationContactMutationResult =
  Apollo.MutationResult<DeleteOrganizationContactMutation>;
export type DeleteOrganizationContactMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteOrganizationContactMutation,
    DeleteOrganizationContactMutationVariables
  >;
export const SearchOrganizationsContactsDocument = gql`
  query SearchOrganizationsContacts($input: SearchOrganizationsContactsInput!) {
    searchOrganizationsContacts(input: $input) {
      contacts {
        allowDeletion
        id
        name
        squareAvatar
        people {
          firstName
          lastName
          deceased
          emailAddresses {
            email
            primary
            historic
          }
          phoneNumbers {
            number
            primary
            historic
          }
        }
        accountList {
          name
          accountListUsers {
            id
            firstName
            lastName
            emailAddresses {
              email
              primary
              historic
            }
          }
        }
        addresses {
          primaryMailingAddress
          street
          city
          state
          postalCode
        }
      }
      pagination {
        page
        perPage
        totalCount
        totalPages
      }
    }
  }
`;
export function useSearchOrganizationsContactsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SearchOrganizationsContactsQuery,
    SearchOrganizationsContactsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SearchOrganizationsContactsQuery,
    SearchOrganizationsContactsQueryVariables
  >(SearchOrganizationsContactsDocument, options);
}
export function useSearchOrganizationsContactsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SearchOrganizationsContactsQuery,
    SearchOrganizationsContactsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SearchOrganizationsContactsQuery,
    SearchOrganizationsContactsQueryVariables
  >(SearchOrganizationsContactsDocument, options);
}
export type SearchOrganizationsContactsQueryHookResult = ReturnType<
  typeof useSearchOrganizationsContactsQuery
>;
export type SearchOrganizationsContactsLazyQueryHookResult = ReturnType<
  typeof useSearchOrganizationsContactsLazyQuery
>;
export type SearchOrganizationsContactsQueryResult = Apollo.QueryResult<
  SearchOrganizationsContactsQuery,
  SearchOrganizationsContactsQueryVariables
>;
