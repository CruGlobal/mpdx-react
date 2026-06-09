import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';

// Override the globally-mocked useSession
export const mockSession = (user: Partial<Session['user']> = {}): void => {
  (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
    data: { ...session, user: { ...session.user, ...user } },
    status: 'authenticated',
    update: () => Promise.resolve(null),
  });
};
