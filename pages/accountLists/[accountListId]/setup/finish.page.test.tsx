import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import AccountPage from './finish.page';

jest.mock('src/lib/apollo/ssrClient');

const accountListId = 'account-list-1';

const push = jest.fn();
const router = {
  query: { accountListId },
  isReady: true,
  push,
};

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <TestRouter router={router}>
    <GqlMockedProvider onCall={mutationSpy}>
      <AccountPage />
    </GqlMockedProvider>
  </TestRouter>
);

describe('Finish account page', () => {
  it('immediately sets setup position to finish', async () => {
    render(<TestComponent />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateSetupPosition', {
        setupPosition: 'finish',
      }),
    );
  });

  it('yes button redirects to tools', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: /Yes/ }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateSetupPosition', {
        setupPosition: '',
      }),
    );
    expect(push).toHaveBeenCalledWith(
      `/accountLists/${accountListId}/tools?setup=1`,
    );
  });

  it('no button redirects to the dashboard', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: /Nope/ }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateSetupPosition', {
        setupPosition: '',
      }),
    );
    expect(push).toHaveBeenCalledWith(`/accountLists/${accountListId}`);
  });
});
