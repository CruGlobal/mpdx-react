import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateNotificationPreferencesMutationVariables = Types.Exact<{
  input: Types.NotificationPreferencesUpdateMutationInput;
}>;

export type UpdateNotificationPreferencesMutation = {
  __typename?: 'Mutation';
} & {
  updateNotificationPreferences?: Types.Maybe<
    { __typename?: 'NotificationPreferencesUpdateMutationPayload' } & {
      notificationPreferences: Array<
        { __typename?: 'NotificationPreference' } & Pick<
          Types.NotificationPreference,
          'id'
        > & {
            notificationType: { __typename?: 'NotificationType' } & Pick<
              Types.NotificationType,
              'id'
            >;
          }
      >;
    }
  >;
};

export const UpdateNotificationPreferencesDocument = gql`
  mutation UpdateNotificationPreferences(
    $input: NotificationPreferencesUpdateMutationInput!
  ) {
    updateNotificationPreferences(input: $input) {
      notificationPreferences {
        id
        notificationType {
          id
        }
      }
    }
  }
`;
export type UpdateNotificationPreferencesMutationFn = Apollo.MutationFunction<
  UpdateNotificationPreferencesMutation,
  UpdateNotificationPreferencesMutationVariables
>;
export function useUpdateNotificationPreferencesMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateNotificationPreferencesMutation,
    UpdateNotificationPreferencesMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateNotificationPreferencesMutation,
    UpdateNotificationPreferencesMutationVariables
  >(UpdateNotificationPreferencesDocument, options);
}
export type UpdateNotificationPreferencesMutationHookResult = ReturnType<
  typeof useUpdateNotificationPreferencesMutation
>;
export type UpdateNotificationPreferencesMutationResult =
  Apollo.MutationResult<UpdateNotificationPreferencesMutation>;
export type UpdateNotificationPreferencesMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateNotificationPreferencesMutation,
    UpdateNotificationPreferencesMutationVariables
  >;
