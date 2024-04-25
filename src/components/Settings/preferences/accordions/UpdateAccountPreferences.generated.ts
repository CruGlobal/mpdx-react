import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { AccountListFragmentDoc } from '../GetAccountPreferences.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateAccountPreferencesMutationVariables = Types.Exact<{
  input: Types.AccountListUpdateMutationInput;
}>;


export type UpdateAccountPreferencesMutation = (
  { __typename?: 'Mutation' }
  & { updateAccountList?: Types.Maybe<(
    { __typename?: 'AccountListUpdateMutationPayload' }
    & { accountList: (
      { __typename?: 'AccountList' }
      & Pick<Types.AccountList, 'id' | 'name' | 'activeMpdMonthlyGoal' | 'activeMpdFinishAt' | 'activeMpdStartAt' | 'salaryOrganizationId'>
      & { settings?: Types.Maybe<(
        { __typename?: 'AccountListSettings' }
        & Pick<Types.AccountListSettings, 'currency' | 'homeCountry' | 'monthlyGoal' | 'tester'>
      )> }
    ) }
  )> }
);


export const UpdateAccountPreferencesDocument = gql`
    mutation UpdateAccountPreferences($input: AccountListUpdateMutationInput!) {
  updateAccountList(input: $input) {
    accountList {
      ...AccountList
    }
  }
}
    ${AccountListFragmentDoc}`;
export type UpdateAccountPreferencesMutationFn = Apollo.MutationFunction<UpdateAccountPreferencesMutation, UpdateAccountPreferencesMutationVariables>;
export function useUpdateAccountPreferencesMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAccountPreferencesMutation, UpdateAccountPreferencesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAccountPreferencesMutation, UpdateAccountPreferencesMutationVariables>(UpdateAccountPreferencesDocument, options);
      }
export type UpdateAccountPreferencesMutationHookResult = ReturnType<typeof useUpdateAccountPreferencesMutation>;
export type UpdateAccountPreferencesMutationResult = Apollo.MutationResult<UpdateAccountPreferencesMutation>;
export type UpdateAccountPreferencesMutationOptions = Apollo.BaseMutationOptions<UpdateAccountPreferencesMutation, UpdateAccountPreferencesMutationVariables>;