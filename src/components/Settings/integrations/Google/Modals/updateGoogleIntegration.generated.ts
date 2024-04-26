import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateGoogleIntegrationMutationVariables = Types.Exact<{
  input: Types.UpdateGoogleIntegrationInput;
}>;

export type UpdateGoogleIntegrationMutation = { __typename?: 'Mutation' } & {
  updateGoogleIntegration: { __typename?: 'GoogleAccountIntegration' } & Pick<
    Types.GoogleAccountIntegration,
    | 'calendarId'
    | 'calendarIntegration'
    | 'calendarIntegrations'
    | 'calendarName'
    | 'createdAt'
    | 'updatedAt'
    | 'id'
    | 'updatedInDbAt'
  > & {
      calendars: Array<
        Types.Maybe<
          { __typename?: 'GoogleAccountIntegrationCalendars' } & Pick<
            Types.GoogleAccountIntegrationCalendars,
            'id' | 'name'
          >
        >
      >;
    };
};

export const UpdateGoogleIntegrationDocument = gql`
  mutation UpdateGoogleIntegration($input: UpdateGoogleIntegrationInput!) {
    updateGoogleIntegration(input: $input) {
      calendarId
      calendarIntegration
      calendarIntegrations
      calendarName
      calendars {
        id
        name
      }
      createdAt
      updatedAt
      id
      updatedInDbAt
    }
  }
`;
export type UpdateGoogleIntegrationMutationFn = Apollo.MutationFunction<
  UpdateGoogleIntegrationMutation,
  UpdateGoogleIntegrationMutationVariables
>;
export function useUpdateGoogleIntegrationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateGoogleIntegrationMutation,
    UpdateGoogleIntegrationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateGoogleIntegrationMutation,
    UpdateGoogleIntegrationMutationVariables
  >(UpdateGoogleIntegrationDocument, options);
}
export type UpdateGoogleIntegrationMutationHookResult = ReturnType<
  typeof useUpdateGoogleIntegrationMutation
>;
export type UpdateGoogleIntegrationMutationResult =
  Apollo.MutationResult<UpdateGoogleIntegrationMutation>;
export type UpdateGoogleIntegrationMutationOptions = Apollo.BaseMutationOptions<
  UpdateGoogleIntegrationMutation,
  UpdateGoogleIntegrationMutationVariables
>;
