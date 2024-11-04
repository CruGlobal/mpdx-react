import { GetServerSidePropsContext } from 'next';
import { getServerSideProps } from './[inviteId].page';

describe('Org Invite Link Redirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to acceptInvite when query parameters are provided', async () => {
    const context = {
      query: {
        orgId: 'test-org-id',
        inviteId: 'test-invite-id',
        code: 'test-code',
      },
    } as unknown as GetServerSidePropsContext;

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: {
        destination:
          '/acceptInvite?orgId=test-org-id&orgInviteId=test-invite-id&inviteCode=test-code',
        permanent: true,
      },
    });
  });

  it('redirects to accountList Dashboard when missing query parameters', async () => {
    const context = {
      query: {
        orgId: 'org-id',
        // inviteId and code are missing
      },
    } as unknown as GetServerSidePropsContext;

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: {
        destination: '/accountLists/_/',
        permanent: true,
      },
    });
  });
});
