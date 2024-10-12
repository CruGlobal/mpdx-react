import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';
import { getServerSideProps } from './[inviteId].page';

jest.mock('next-auth/react');

describe('Invite Link Redirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to acceptInvite when query parameters are provided', async () => {
    (getSession as jest.Mock).mockResolvedValueOnce({ user: { name: 'test' } });

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
        session: { user: { name: 'test' } },
      },
    });
  });

  it('redirects to accountList Dashboard when missing query parameters', async () => {
    (getSession as jest.Mock).mockResolvedValueOnce({ user: { name: 'test' } });

    const context = {
      query: {
        accountListId: 'test-account-list-id',
        // inviteId and code are missing
      },
    } as unknown as GetServerSidePropsContext;

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: {
        destination: '/accountLists/test-account-list-id',
        permanent: true,
      },
      props: {
        session: { user: { name: 'test' } },
      },
    });
  });
});
