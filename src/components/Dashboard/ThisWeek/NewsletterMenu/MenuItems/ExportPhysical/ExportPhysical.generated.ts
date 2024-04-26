import * as Types from '../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateExportedContactsMutationVariables = Types.Exact<{
  input: Types.ExportContactsInput;
}>;

export type CreateExportedContactsMutation = { __typename?: 'Mutation' } & Pick<
  Types.Mutation,
  'exportContacts'
>;

export const CreateExportedContactsDocument = gql`
  mutation CreateExportedContacts($input: ExportContactsInput!) {
    exportContacts(input: $input)
  }
`;
export type CreateExportedContactsMutationFn = Apollo.MutationFunction<
  CreateExportedContactsMutation,
  CreateExportedContactsMutationVariables
>;
export function useCreateExportedContactsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateExportedContactsMutation,
    CreateExportedContactsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateExportedContactsMutation,
    CreateExportedContactsMutationVariables
  >(CreateExportedContactsDocument, options);
}
export type CreateExportedContactsMutationHookResult = ReturnType<
  typeof useCreateExportedContactsMutation
>;
export type CreateExportedContactsMutationResult =
  Apollo.MutationResult<CreateExportedContactsMutation>;
export type CreateExportedContactsMutationOptions = Apollo.BaseMutationOptions<
  CreateExportedContactsMutation,
  CreateExportedContactsMutationVariables
>;
