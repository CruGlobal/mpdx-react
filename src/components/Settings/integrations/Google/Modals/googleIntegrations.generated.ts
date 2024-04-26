import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GoogleAccountIntegrationsQueryVariables = Types.Exact<{
  input: Types.GoogleAccountIntegrationsInput;
}>;

export type GoogleAccountIntegrationsQuery = { __typename?: 'Query' } & {
  googleAccountIntegrations: Array<
    Types.Maybe<
      { __typename?: 'GoogleAccountIntegration' } & Pick<
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
        }
    >
  >;
};

export type GetIntegrationActivitiesQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetIntegrationActivitiesQuery = { __typename?: 'Query' } & {
  constant: { __typename?: 'Constant' } & {
    activities?: Types.Maybe<
      Array<{ __typename?: 'IdValue' } & Pick<Types.IdValue, 'id' | 'value'>>
    >;
  };
};

export type CreateGoogleIntegrationMutationVariables = Types.Exact<{
  input: Types.CreateGoogleIntegrationInput;
}>;

export type CreateGoogleIntegrationMutation = { __typename?: 'Mutation' } & {
  createGoogleIntegration: { __typename?: 'GoogleAccountIntegration' } & Pick<
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

export const GoogleAccountIntegrationsDocument = gql`
  query GoogleAccountIntegrations($input: GoogleAccountIntegrationsInput!) {
    googleAccountIntegrations(input: $input) {
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
export function useGoogleAccountIntegrationsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GoogleAccountIntegrationsQuery,
    GoogleAccountIntegrationsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GoogleAccountIntegrationsQuery,
    GoogleAccountIntegrationsQueryVariables
  >(GoogleAccountIntegrationsDocument, options);
}
export function useGoogleAccountIntegrationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GoogleAccountIntegrationsQuery,
    GoogleAccountIntegrationsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GoogleAccountIntegrationsQuery,
    GoogleAccountIntegrationsQueryVariables
  >(GoogleAccountIntegrationsDocument, options);
}
export type GoogleAccountIntegrationsQueryHookResult = ReturnType<
  typeof useGoogleAccountIntegrationsQuery
>;
export type GoogleAccountIntegrationsLazyQueryHookResult = ReturnType<
  typeof useGoogleAccountIntegrationsLazyQuery
>;
export type GoogleAccountIntegrationsQueryResult = Apollo.QueryResult<
  GoogleAccountIntegrationsQuery,
  GoogleAccountIntegrationsQueryVariables
>;
export const GetIntegrationActivitiesDocument = gql`
  query GetIntegrationActivities {
    constant {
      activities {
        id
        value
      }
    }
  }
`;
export function useGetIntegrationActivitiesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetIntegrationActivitiesQuery,
    GetIntegrationActivitiesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetIntegrationActivitiesQuery,
    GetIntegrationActivitiesQueryVariables
  >(GetIntegrationActivitiesDocument, options);
}
export function useGetIntegrationActivitiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetIntegrationActivitiesQuery,
    GetIntegrationActivitiesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetIntegrationActivitiesQuery,
    GetIntegrationActivitiesQueryVariables
  >(GetIntegrationActivitiesDocument, options);
}
export type GetIntegrationActivitiesQueryHookResult = ReturnType<
  typeof useGetIntegrationActivitiesQuery
>;
export type GetIntegrationActivitiesLazyQueryHookResult = ReturnType<
  typeof useGetIntegrationActivitiesLazyQuery
>;
export type GetIntegrationActivitiesQueryResult = Apollo.QueryResult<
  GetIntegrationActivitiesQuery,
  GetIntegrationActivitiesQueryVariables
>;
export const CreateGoogleIntegrationDocument = gql`
  mutation CreateGoogleIntegration($input: CreateGoogleIntegrationInput!) {
    createGoogleIntegration(input: $input) {
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
export type CreateGoogleIntegrationMutationFn = Apollo.MutationFunction<
  CreateGoogleIntegrationMutation,
  CreateGoogleIntegrationMutationVariables
>;
export function useCreateGoogleIntegrationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateGoogleIntegrationMutation,
    CreateGoogleIntegrationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateGoogleIntegrationMutation,
    CreateGoogleIntegrationMutationVariables
  >(CreateGoogleIntegrationDocument, options);
}
export type CreateGoogleIntegrationMutationHookResult = ReturnType<
  typeof useCreateGoogleIntegrationMutation
>;
export type CreateGoogleIntegrationMutationResult =
  Apollo.MutationResult<CreateGoogleIntegrationMutation>;
export type CreateGoogleIntegrationMutationOptions = Apollo.BaseMutationOptions<
  CreateGoogleIntegrationMutation,
  CreateGoogleIntegrationMutationVariables
>;
