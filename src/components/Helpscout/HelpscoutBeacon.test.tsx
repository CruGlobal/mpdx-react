import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { identifyUser } from 'src/lib/helpScout';
import { GetUserQuery } from '../User/GetUser.generated';
import HelpscoutBeacon from './HelpscoutBeacon';
import { getSession } from 'next-auth/react';

jest.mock('next-auth/react');

const session = {
  expires: '2021-10-28T14:48:20.897Z',
  user: {
    email: 'Chair Library Bed',
    image: null,
    name: 'Dung Tapestry',
    token: 'superLongJwtString',
  },
};

jest.mock('src/lib/helpScout', () => ({
  callBeacon: jest.fn(),
  destroy: jest.fn(),
  initBeacon: jest.fn(),
  identifyUser: jest.fn(),
}));

describe('HelpscoutBeacon', () => {
  (getSession as jest.Mock).mockResolvedValue(session);

  it('identifies the current user', async () => {
    render(
      <GqlMockedProvider<{ GetUser: GetUserQuery }>
        mocks={{
          GetUser: {
            user: {
              id: 'user-1',
              firstName: 'First',
              lastName: 'Last',
              keyAccounts: [
                {
                  email: 'first.last@cru.org',
                },
              ],
            },
          },
        }}
      >
        <HelpscoutBeacon />
      </GqlMockedProvider>,
    );

    await waitFor(() =>
      expect(identifyUser).toHaveBeenCalledWith(
        'user-1',
        'first.last@cru.org',
        'First Last',
      ),
    );
  });
});
