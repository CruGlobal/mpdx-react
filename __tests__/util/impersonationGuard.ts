import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import {
  ImpersonationArea,
  ImpersonatorRole,
  canAccessWhileImpersonating,
} from 'src/lib/impersonationAccess';

const context = {
  query: { accountListId: 'account-list-1' },
  resolvedUrl: '/accountLists/account-list-1/page',
} as unknown as GetServerSidePropsContext;

const blockedRedirect = {
  redirect: {
    destination: '/accountLists/account-list-1?redirect=impersonation-blocked',
    permanent: false,
  },
};

type GuardOutcome = 'allowed' | 'blocked' | 'unexpected';

/** Who is visiting the page: a user on their own account, or an impersonator with the given role. */
type Visitor = 'own account' | 'unknown impersonator' | ImpersonatorRole;

export type GuardOutcomes = Record<Visitor, GuardOutcome>;

/**
 * Runs a page's `getServerSideProps` as a user on their own account and as an
 * impersonator with each role, reporting whether each visitor was given the
 * page props or redirected as blocked. Compare the result against
 * `expectedGuardOutcomes(area)` to assert that the page is guarded by
 * `blockImpersonation(area)`.
 */
export const impersonationGuardOutcomes = async (
  getServerSideProps: GetServerSideProps,
): Promise<GuardOutcomes> => {
  const mockedGetSession = getSession as jest.MockedFn<typeof getSession>;

  const visit = async (
    user: Partial<typeof session.user>,
  ): Promise<GuardOutcome> => {
    mockedGetSession.mockResolvedValue({
      ...session,
      user: { ...session.user, ...user },
    });
    const result = await getServerSideProps(context);
    if ('props' in result) {
      return 'allowed';
    }
    return JSON.stringify(result) === JSON.stringify(blockedRedirect)
      ? 'blocked'
      : 'unexpected';
  };

  try {
    const roleOutcomes = {} as Record<ImpersonatorRole, GuardOutcome>;
    for (const role of Object.values(ImpersonatorRole)) {
      roleOutcomes[role] = await visit({
        impersonating: true,
        impersonatorRole: role,
      });
    }
    return {
      'own account': await visit({ impersonating: false }),
      'unknown impersonator': await visit({
        impersonating: true,
        impersonatorRole: undefined,
      }),
      ...roleOutcomes,
    };
  } finally {
    mockedGetSession.mockResolvedValue(session);
  }
};

/** The outcomes `blockImpersonation(area)` produces, per the access table. */
export const expectedGuardOutcomes = (
  area: ImpersonationArea,
): GuardOutcomes => {
  const roleOutcomes = {} as Record<ImpersonatorRole, GuardOutcome>;
  for (const role of Object.values(ImpersonatorRole)) {
    roleOutcomes[role] = canAccessWhileImpersonating(role, area)
      ? 'allowed'
      : 'blocked';
  }
  return {
    'own account': 'allowed',
    'unknown impersonator': 'blocked',
    ...roleOutcomes,
  };
};
