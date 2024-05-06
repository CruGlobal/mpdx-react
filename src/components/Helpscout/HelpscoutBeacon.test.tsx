import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { identifyUser } from 'src/lib/helpScout';
import { GetUserQuery } from '../User/GetUser.generated';
import HelpscoutBeacon from './HelpscoutBeacon';

jest.mock('src/lib/helpScout', () => ({
  callBeacon: jest.fn(),
  destroy: jest.fn(),
  initBeacon: jest.fn(),
  identifyUser: jest.fn(),
}));

describe('HelpscoutBeacon', () => {
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
