import { ApolloError } from '@apollo/client';

/** Sent by the API when HCM has no record of the person, such as staff who have left */
export const HCM_PERSON_NOT_FOUND_CODE = 'HCM_PERSON_NOT_FOUND';

/**
 * The HCM errors a report handles itself, so the global error link does not toast them. Pass the
 * same codes to the page's Hcm query and to both HcmSync status components.
 */
export const HANDLED_HCM_ERROR_CODES = [HCM_PERSON_NOT_FOUND_CODE];

export const isHcmPersonNotFoundError = (
  error: ApolloError | undefined,
): boolean =>
  !!error?.graphQLErrors.some(
    ({ extensions }) => extensions?.code === HCM_PERSON_NOT_FOUND_CODE,
  );
