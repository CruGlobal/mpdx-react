import { DesignationSupportFormType } from 'src/graphql/types.generated';

export const isSimpleFormType = (
  formType: DesignationSupportFormType,
): boolean => formType === DesignationSupportFormType.Simple;
