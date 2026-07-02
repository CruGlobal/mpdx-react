import { GetServerSidePropsContext } from 'next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { getServerSideProps } from './index.page';

jest.mock('pages/api/utils/pagePropsHelpers', () => ({
  blockImpersonatingNonDevelopers: jest.fn(),
}));

const mockBlockImpersonatingNonDevelopers =
  blockImpersonatingNonDevelopers as jest.MockedFunction<
    typeof blockImpersonatingNonDevelopers
  >;

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
    expect(mockBlockImpersonatingNonDevelopers).not.toHaveBeenCalled();
  });

  it('delegates to blockImpersonatingNonDevelopers when the flag is unset', async () => {
    delete process.env.DISABLE_MPD_GOAL_ADMIN;
    const expected = { props: { session: {} } };
    mockBlockImpersonatingNonDevelopers.mockResolvedValue(
      expected as Awaited<ReturnType<typeof blockImpersonatingNonDevelopers>>,
    );

    const result = await getServerSideProps(context);

    expect(mockBlockImpersonatingNonDevelopers).toHaveBeenCalledWith(context);
    expect(result).toBe(expected);
  });
});
