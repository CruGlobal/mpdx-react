import * as Types from '../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AcknowledgeAllUserNotificationsMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type AcknowledgeAllUserNotificationsMutation = {
  __typename?: 'Mutation';
} & {
  acknowledgeAllUserNotifications?: Types.Maybe<
    { __typename?: 'AcknowledgeAllUserNotificationsMutationPayload' } & Pick<
      Types.AcknowledgeAllUserNotificationsMutationPayload,
      'notificationIds'
    >
  >;
};

export const AcknowledgeAllUserNotificationsDocument = gql`
  mutation AcknowledgeAllUserNotifications($accountListId: ID!) {
    acknowledgeAllUserNotifications(input: { accountListId: $accountListId }) {
      notificationIds
    }
  }
`;
export type AcknowledgeAllUserNotificationsMutationFn = Apollo.MutationFunction<
  AcknowledgeAllUserNotificationsMutation,
  AcknowledgeAllUserNotificationsMutationVariables
>;
export function useAcknowledgeAllUserNotificationsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AcknowledgeAllUserNotificationsMutation,
    AcknowledgeAllUserNotificationsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AcknowledgeAllUserNotificationsMutation,
    AcknowledgeAllUserNotificationsMutationVariables
  >(AcknowledgeAllUserNotificationsDocument, options);
}
export type AcknowledgeAllUserNotificationsMutationHookResult = ReturnType<
  typeof useAcknowledgeAllUserNotificationsMutation
>;
export type AcknowledgeAllUserNotificationsMutationResult =
  Apollo.MutationResult<AcknowledgeAllUserNotificationsMutation>;
export type AcknowledgeAllUserNotificationsMutationOptions =
  Apollo.BaseMutationOptions<
    AcknowledgeAllUserNotificationsMutation,
    AcknowledgeAllUserNotificationsMutationVariables
  >;
