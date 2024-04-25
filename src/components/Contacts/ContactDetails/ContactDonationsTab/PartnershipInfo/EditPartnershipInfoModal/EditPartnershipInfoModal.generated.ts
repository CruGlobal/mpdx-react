import * as Types from '../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateContactPartnershipMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.ContactUpdateInput;
}>;


export type UpdateContactPartnershipMutation = (
  { __typename?: 'Mutation' }
  & { updateContact?: Types.Maybe<(
    { __typename?: 'ContactUpdateMutationPayload' }
    & { contact: (
      { __typename?: 'Contact' }
      & Pick<Types.Contact, 'id' | 'status' | 'pledgeAmount' | 'pledgeFrequency' | 'pledgeCurrency' | 'pledgeStartDate' | 'nextAsk' | 'noAppeals' | 'sendNewsletter' | 'likelyToGive'>
      & { contactReferralsToMe: (
        { __typename?: 'ReferralConnection' }
        & { nodes: Array<(
          { __typename?: 'Referral' }
          & Pick<Types.Referral, 'id'>
          & { referredBy: (
            { __typename?: 'Contact' }
            & Pick<Types.Contact, 'id' | 'name'>
          ) }
        )> }
      ) }
    ) }
  )> }
);

export type GetDataForPartnershipInfoModalQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactsFilter?: Types.InputMaybe<Types.ContactFilterSetInput>;
}>;


export type GetDataForPartnershipInfoModalQuery = (
  { __typename?: 'Query' }
  & { contacts: (
    { __typename?: 'ContactConnection' }
    & { nodes: Array<(
      { __typename?: 'Contact' }
      & Pick<Types.Contact, 'id' | 'name'>
    )> }
  ) }
);


export const UpdateContactPartnershipDocument = gql`
    mutation UpdateContactPartnership($accountListId: ID!, $attributes: ContactUpdateInput!) {
  updateContact(input: {accountListId: $accountListId, attributes: $attributes}) {
    contact {
      id
      status
      pledgeAmount
      pledgeFrequency
      pledgeCurrency
      pledgeStartDate
      nextAsk
      noAppeals
      sendNewsletter
      contactReferralsToMe(first: 10) {
        nodes {
          id
          referredBy {
            id
            name
          }
        }
      }
      likelyToGive
    }
  }
}
    `;
export type UpdateContactPartnershipMutationFn = Apollo.MutationFunction<UpdateContactPartnershipMutation, UpdateContactPartnershipMutationVariables>;
export function useUpdateContactPartnershipMutation(baseOptions?: Apollo.MutationHookOptions<UpdateContactPartnershipMutation, UpdateContactPartnershipMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateContactPartnershipMutation, UpdateContactPartnershipMutationVariables>(UpdateContactPartnershipDocument, options);
      }
export type UpdateContactPartnershipMutationHookResult = ReturnType<typeof useUpdateContactPartnershipMutation>;
export type UpdateContactPartnershipMutationResult = Apollo.MutationResult<UpdateContactPartnershipMutation>;
export type UpdateContactPartnershipMutationOptions = Apollo.BaseMutationOptions<UpdateContactPartnershipMutation, UpdateContactPartnershipMutationVariables>;
export const GetDataForPartnershipInfoModalDocument = gql`
    query GetDataForPartnershipInfoModal($accountListId: ID!, $contactsFilter: ContactFilterSetInput) {
  contacts(
    accountListId: $accountListId
    contactsFilter: $contactsFilter
    first: 10
  ) {
    nodes {
      id
      name
    }
  }
}
    `;
export function useGetDataForPartnershipInfoModalQuery(baseOptions: Apollo.QueryHookOptions<GetDataForPartnershipInfoModalQuery, GetDataForPartnershipInfoModalQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDataForPartnershipInfoModalQuery, GetDataForPartnershipInfoModalQueryVariables>(GetDataForPartnershipInfoModalDocument, options);
      }
export function useGetDataForPartnershipInfoModalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDataForPartnershipInfoModalQuery, GetDataForPartnershipInfoModalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDataForPartnershipInfoModalQuery, GetDataForPartnershipInfoModalQueryVariables>(GetDataForPartnershipInfoModalDocument, options);
        }
export type GetDataForPartnershipInfoModalQueryHookResult = ReturnType<typeof useGetDataForPartnershipInfoModalQuery>;
export type GetDataForPartnershipInfoModalLazyQueryHookResult = ReturnType<typeof useGetDataForPartnershipInfoModalLazyQuery>;
export type GetDataForPartnershipInfoModalQueryResult = Apollo.QueryResult<GetDataForPartnershipInfoModalQuery, GetDataForPartnershipInfoModalQueryVariables>;