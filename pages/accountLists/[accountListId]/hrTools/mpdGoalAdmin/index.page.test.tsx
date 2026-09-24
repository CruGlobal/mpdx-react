import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';
import {
  expectedGuardOutcomes,
  impersonationGuardOutcomes,
} from '__tests__/util/impersonationGuard';
import { ImpersonationArea } from 'src/lib/impersonationAccess';
import { getServerSideProps } from './index.page';

const context = {} as GetServerSidePropsContext;

describe('MpdGoalAdmin getServerSideProps', () => {
  const originalFlag = process.env.DISABLE_MPD_GOAL_ADMIN;

  afterEach(() => {
    process.env.DISABLE_MPD_GOAL_ADMIN = originalFlag;
    jest.clearAllMocks();
  });

  it('returns notFound and does not delegate when the flag is set', async () => {
    process.env.DISABLE_MPD_GOAL_ADMIN = 'true';

    const result = await getServerSideProps(context);

    expect(result).toEqual({ notFound: true });
    expect(getSession).not.toHaveBeenCalled();
  });

  it('guards by impersonator role when the flag is unset', async () => {
    delete process.env.DISABLE_MPD_GOAL_ADMIN;

    expect(await impersonationGuardOutcomes(getServerSideProps)).toEqual(
      expectedGuardOutcomes(ImpersonationArea.MpdGoalAdmin),
    );
  });
});
