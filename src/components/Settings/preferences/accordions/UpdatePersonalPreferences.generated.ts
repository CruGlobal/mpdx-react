import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdatePersonalPreferencesMutationVariables = Types.Exact<{
  input: Types.UserPreferenceUpdateMutationInput;
}>;


export type UpdatePersonalPreferencesMutation = (
  { __typename?: 'Mutation' }
  & { updatePreference?: Types.Maybe<(
    { __typename?: 'UserPreferenceUpdateMutationPayload' }
    & { preference: (
      { __typename?: 'Preference' }
      & Pick<Types.Preference, 'id' | 'hourToSendNotifications' | 'locale' | 'localeDisplay' | 'timeZone'>
    ) }
  )> }
);


export const UpdatePersonalPreferencesDocument = gql`
    mutation UpdatePersonalPreferences($input: UserPreferenceUpdateMutationInput!) {
  updatePreference(input: $input) {
    preference {
      id
      hourToSendNotifications
      locale
      localeDisplay
      timeZone
    }
  }
}
    `;
export type UpdatePersonalPreferencesMutationFn = Apollo.MutationFunction<UpdatePersonalPreferencesMutation, UpdatePersonalPreferencesMutationVariables>;
export function useUpdatePersonalPreferencesMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePersonalPreferencesMutation, UpdatePersonalPreferencesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePersonalPreferencesMutation, UpdatePersonalPreferencesMutationVariables>(UpdatePersonalPreferencesDocument, options);
      }
export type UpdatePersonalPreferencesMutationHookResult = ReturnType<typeof useUpdatePersonalPreferencesMutation>;
export type UpdatePersonalPreferencesMutationResult = Apollo.MutationResult<UpdatePersonalPreferencesMutation>;
export type UpdatePersonalPreferencesMutationOptions = Apollo.BaseMutationOptions<UpdatePersonalPreferencesMutation, UpdatePersonalPreferencesMutationVariables>;