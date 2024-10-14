import { GetServerSidePropsContext } from 'next';
import { session } from '__tests__/fixtures/session';
import { getServerSideProps } from './[inviteId].page';

describe('Account Invite Link Redirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to acceptInvite when query parameters are provided', async () => {
    const context = {
      query: {
        accountListId: 'test-account-list-id',
        inviteId: 'test-invite-id',
        code: 'test-code',
      },
    } as unknown as GetServerSidePropsContext;

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: {
        destination:
          '/acceptInvite?accountListId=test-account-list-id&accountInviteId=test-invite-id&inviteCode=test-code',
        permanent: true,
      },
      props: {
        session: session,
      },
    });
  });

  it('redirects to accountList Dashboard when missing query parameters', async () => {
    const context = {
      query: {
        accountListId: 'test-account-list-id',
        // inviteId and code are missing
      },
    } as unknown as GetServerSidePropsContext;

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: {
        destination: '/accountLists/_/',
        permanent: true,
      },
      props: {
        session: session,
      },
    });
  });
});
