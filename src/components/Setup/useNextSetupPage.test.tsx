import { ReactElement } from 'react';
import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UserSetupStageEnum } from 'src/graphql/types.generated';
import { SetupStageQuery } from './Setup.generated';
import { useNextSetupPage } from './useNextSetupPage';

const push = jest.fn();
const router = {
  push,
};

interface HookWrapperProps {
  setup: UserSetupStageEnum | null;
  children: ReactElement;
}

const mutationSpy = jest.fn();

const HookWrapper: React.FC<HookWrapperProps> = ({ setup, children }) => (
  <TestRouter router={router}>
    <GqlMockedProvider<{ SetupStage: SetupStageQuery }>
      mocks={{
        SetupStage: {
          user: {
            defaultAccountList: 'account-list-1',
            setup,
          },
        },
      }}
      onCall={mutationSpy}
    >
      {children}
    </GqlMockedProvider>
  </TestRouter>
);

type HookWrapper = React.FC<{ children: ReactElement }>;

describe('useNextSetupPage', () => {
  it('when the user has no organization accounts next should redirect to the connect page', async () => {
    const Wrapper: HookWrapper = ({ children }) => (
      <HookWrapper setup={UserSetupStageEnum.NoOrganizationAccount}>
        {children}
      </HookWrapper>
    );

    const { result } = renderHook(() => useNextSetupPage(), {
      wrapper: Wrapper,
    });
    result.current.next();

    await waitFor(() => expect(push).toHaveBeenCalledWith('/setup/connect'));
  });

  it('when the user has no account lists next should redirect to the connect page', async () => {
    const Wrapper: HookWrapper = ({ children }) => (
      <HookWrapper setup={UserSetupStageEnum.NoAccountLists}>
        {children}
      </HookWrapper>
    );

    const { result } = renderHook(() => useNextSetupPage(), {
      wrapper: Wrapper,
    });
    result.current.next();

    await waitFor(() => expect(push).toHaveBeenCalledWith('/setup/connect'));
  });

  it('when the user has no default account list next should redirect to the account page', async () => {
    const Wrapper: HookWrapper = ({ children }) => (
      <HookWrapper setup={UserSetupStageEnum.NoDefaultAccountList}>
        {children}
      </HookWrapper>
    );

    const { result } = renderHook(() => useNextSetupPage(), {
      wrapper: Wrapper,
    });
    result.current.next();

    await waitFor(() => expect(push).toHaveBeenCalledWith('/setup/account'));
  });

  it("when the user's account is set up next should set setup_position and redirect to the preferences page", async () => {
    const Wrapper: HookWrapper = ({ children }) => (
      <HookWrapper setup={null}>{children}</HookWrapper>
    );

    const { result } = renderHook(() => useNextSetupPage(), {
      wrapper: Wrapper,
    });
    result.current.next();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateUserOptions', {
        key: 'setup_position',
        value: 'preferences.personal',
      }),
    );
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/accountLists/account-list-1/settings/preferences',
      ),
    );
  });
});
