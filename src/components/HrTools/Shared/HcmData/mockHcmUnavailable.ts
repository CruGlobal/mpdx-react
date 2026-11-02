import { GraphQLError } from 'graphql';
import { DeepPartialMock } from '__tests__/util/graphqlMocking';
import { HcmQuery } from './Hcm.generated';
import { HCM_UNAVAILABLE_CODE } from './HcmUnavailableAlert';

type HcmMock = DeepPartialMock<HcmQuery['hcm']>;

/**
 * Wraps an `Hcm` mock so its first `failedCalls` calls fail with `HCM_UNAVAILABLE`, then it
 * returns `hcm`. Create one per render so each test starts with a fresh call count.
 */
export const mockHcmUnavailable = (
  hcm: HcmMock,
  failedCalls = Infinity,
): HcmMock => {
  if (failedCalls <= 0) {
    return hcm;
  }
  let calls = 0;
  return (() => {
    if (calls++ < failedCalls) {
      throw new GraphQLError('HCM UserInfo service unavailable', {
        extensions: { code: HCM_UNAVAILABLE_CODE },
      });
    }
    return hcm;
  }) as unknown as HcmMock;
};
