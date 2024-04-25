import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SearchOrganizationsAccountListsQueryVariables = Types.Exact<{
  input: Types.SearchOrganizationsAccountListsInput;
}>;


export type SearchOrganizationsAccountListsQuery = (
  { __typename?: 'Query' }
  & { searchOrganizationsAccountLists: (
    { __typename?: 'SearchOrganizationsAccountListsResponse' }
    & { pagination: (
      { __typename?: 'Pagination' }
      & Pick<Types.Pagination, 'page' | 'perPage' | 'totalCount' | 'totalPages'>
    ), accountLists: Array<Types.Maybe<(
      { __typename?: 'OrganizationsAccountList' }
      & Pick<Types.OrganizationsAccountList, 'name' | 'id'>
      & { designationAccounts?: Types.Maybe<Array<Types.Maybe<(
        { __typename?: 'AccountListDesignationAccounts' }
        & Pick<Types.AccountListDesignationAccounts, 'id' | 'displayName'>
        & { organization?: Types.Maybe<(
          { __typename?: 'AccountListOrganization' }
          & Pick<Types.AccountListOrganization, 'id' | 'name'>
        )> }
      )>>>, accountListUsersInvites?: Types.Maybe<Array<Types.Maybe<(
        { __typename?: 'AccountListInvites' }
        & Pick<Types.AccountListInvites, 'id' | 'inviteUserAs' | 'recipientEmail'>
        & { invitedByUser?: Types.Maybe<(
          { __typename?: 'AccountListInvitedByUser' }
          & Pick<Types.AccountListInvitedByUser, 'id' | 'firstName' | 'lastName'>
        )> }
      )>>>, accountListUsers?: Types.Maybe<Array<Types.Maybe<(
        { __typename?: 'AccountListUsers' }
        & Pick<Types.AccountListUsers, 'id' | 'userFirstName' | 'userLastName' | 'allowDeletion'>
        & { userEmailAddresses?: Types.Maybe<Array<Types.Maybe<(
          { __typename?: 'AccountListEmailAddresses' }
          & Pick<Types.AccountListEmailAddresses, 'id' | 'email' | 'primary'>
        )>>> }
      )>>>, accountListCoaches?: Types.Maybe<Array<Types.Maybe<(
        { __typename?: 'OrganizationAccountListCoaches' }
        & Pick<Types.OrganizationAccountListCoaches, 'id' | 'coachFirstName' | 'coachLastName'>
        & { coachEmailAddresses?: Types.Maybe<Array<Types.Maybe<(
          { __typename?: 'AccountListEmailAddresses' }
          & Pick<Types.AccountListEmailAddresses, 'id' | 'email' | 'primary'>
        )>>> }
      )>>>, accountListCoachInvites?: Types.Maybe<Array<Types.Maybe<(
        { __typename?: 'AccountListInvites' }
        & Pick<Types.AccountListInvites, 'id' | 'inviteUserAs' | 'recipientEmail'>
        & { invitedByUser?: Types.Maybe<(
          { __typename?: 'AccountListInvitedByUser' }
          & Pick<Types.AccountListInvitedByUser, 'id' | 'firstName' | 'lastName'>
        )> }
      )>>> }
    )>> }
  ) }
);


export const SearchOrganizationsAccountListsDocument = gql`
    query SearchOrganizationsAccountLists($input: SearchOrganizationsAccountListsInput!) {
  searchOrganizationsAccountLists(input: $input) {
    pagination {
      page
      perPage
      totalCount
      totalPages
    }
    accountLists {
      name
      id
      designationAccounts {
        id
        displayName
        organization {
          id
          name
        }
      }
      accountListUsersInvites {
        id
        inviteUserAs
        recipientEmail
        invitedByUser {
          id
          firstName
          lastName
        }
      }
      accountListUsers {
        id
        userFirstName
        userLastName
        allowDeletion
        userEmailAddresses {
          id
          email
          primary
        }
      }
      accountListCoaches {
        id
        coachFirstName
        coachLastName
        coachEmailAddresses {
          id
          email
          primary
        }
      }
      accountListCoachInvites {
        id
        inviteUserAs
        recipientEmail
        invitedByUser {
          id
          firstName
          lastName
        }
      }
    }
  }
}
    `;
export function useSearchOrganizationsAccountListsQuery(baseOptions: Apollo.QueryHookOptions<SearchOrganizationsAccountListsQuery, SearchOrganizationsAccountListsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchOrganizationsAccountListsQuery, SearchOrganizationsAccountListsQueryVariables>(SearchOrganizationsAccountListsDocument, options);
      }
export function useSearchOrganizationsAccountListsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchOrganizationsAccountListsQuery, SearchOrganizationsAccountListsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchOrganizationsAccountListsQuery, SearchOrganizationsAccountListsQueryVariables>(SearchOrganizationsAccountListsDocument, options);
        }
export type SearchOrganizationsAccountListsQueryHookResult = ReturnType<typeof useSearchOrganizationsAccountListsQuery>;
export type SearchOrganizationsAccountListsLazyQueryHookResult = ReturnType<typeof useSearchOrganizationsAccountListsLazyQuery>;
export type SearchOrganizationsAccountListsQueryResult = Apollo.QueryResult<SearchOrganizationsAccountListsQuery, SearchOrganizationsAccountListsQueryVariables>;