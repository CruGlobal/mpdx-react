import { DesignationSupportFormType } from 'src/graphql/types.generated';

export const isSimpleFormType = (
  formType: DesignationSupportFormType | null | undefined,
): boolean => formType === DesignationSupportFormType.Simple;
