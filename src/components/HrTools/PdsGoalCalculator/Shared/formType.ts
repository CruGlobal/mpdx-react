import { DesignationSupportFormType } from 'src/graphql/types.generated';

export const isSimpleFormType = (
  formType: DesignationSupportFormType | null | undefined,
): boolean => formType === DesignationSupportFormType.Simple;

export const isDesignationSupportFormType = (
  value: string,
): value is DesignationSupportFormType =>
  (Object.values(DesignationSupportFormType) as string[]).includes(value);
