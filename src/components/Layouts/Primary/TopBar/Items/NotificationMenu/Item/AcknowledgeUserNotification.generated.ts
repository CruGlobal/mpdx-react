import * as Types from '../../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AcknowledgeUserNotificationMutationVariables = Types.Exact<{
  notificationId: Types.Scalars['ID']['input'];
}>;

export type AcknowledgeUserNotificationMutation = {
  __typename?: 'Mutation';
} & {
  acknowledgeUserNotification?: Types.Maybe<
    { __typename?: 'AcknowledgeUserNotificationMutationPayload' } & {
      notification: { __typename?: 'UserNotification' } & Pick<
        Types.UserNotification,
        'id' | 'read'
      >;
    }
  >;
};

export const AcknowledgeUserNotificationDocument = gql`
  mutation AcknowledgeUserNotification($notificationId: ID!) {
    acknowledgeUserNotification(input: { notificationId: $notificationId }) {
      notification {
        id
        read
      }
    }
  }
`;
export type AcknowledgeUserNotificationMutationFn = Apollo.MutationFunction<
  AcknowledgeUserNotificationMutation,
  AcknowledgeUserNotificationMutationVariables
>;
export function useAcknowledgeUserNotificationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AcknowledgeUserNotificationMutation,
    AcknowledgeUserNotificationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AcknowledgeUserNotificationMutation,
    AcknowledgeUserNotificationMutationVariables
  >(AcknowledgeUserNotificationDocument, options);
}
export type AcknowledgeUserNotificationMutationHookResult = ReturnType<
  typeof useAcknowledgeUserNotificationMutation
>;
export type AcknowledgeUserNotificationMutationResult =
  Apollo.MutationResult<AcknowledgeUserNotificationMutation>;
export type AcknowledgeUserNotificationMutationOptions =
  Apollo.BaseMutationOptions<
    AcknowledgeUserNotificationMutation,
    AcknowledgeUserNotificationMutationVariables
  >;
