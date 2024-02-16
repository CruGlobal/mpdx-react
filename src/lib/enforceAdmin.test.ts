import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';
import { enforceAdmin } from './enforceAdmin';

jest.mock('next-auth/react');

const context = {
  query: { accountListId: 'account-list-1' },
} as unknown as GetServerSidePropsContext;

describe('enforceAdmin', () => {
  it('does not return a redirect if the user is an admin', async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { admin: true } });

    await expect(enforceAdmin(context)).resolves.not.toMatchObject({
      redirect: {},
    });
  });

  it('returns a redirect if the user is not an admin', async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { admin: false } });

    await expect(enforceAdmin(context)).resolves.toMatchObject({
      redirect: {
        destination: '/accountLists/account-list-1',
      },
    });
  });
});
