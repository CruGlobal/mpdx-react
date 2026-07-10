import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { UserOptionQuery } from './UserPreference.generated';
import { useNavPages } from './useNavPages';

const accountListId = 'account-list-1';

const makeWrapper = (userType: UserTypeEnum) => {
  const wrapper = ({ children }: { children: ReactElement }) => (
    <TestRouter router={{ query: { accountListId }, isReady: true }}>
      <GqlMockedProvider<{ GetUser: GetUserQuery; UserOption: UserOptionQuery }>
        mocks={{
          GetUser: { user: { userType } },
          UserOption: {
            userOption: { key: 'user_type_verified', value: 'true' },
          },
        }}
      >
        {children}
      </GqlMockedProvider>
    </TestRouter>
  );
  wrapper.displayName = 'NavPagesWrapper';
  return wrapper;
};

describe('useNavPages', () => {
  it('shows the HR Tools tab for a us staff user', async () => {
    const { result, waitFor } = renderHook(() => useNavPages(false), {
      wrapper: makeWrapper(UserTypeEnum.UsStaff),
    });

    await waitFor(() =>
      expect(result.current.navPages.map((page) => page.id)).toContain(
        'hr-tools-page',
      ),
    );
  });

  it('shows the HR Tools tab for a hybrid staff user', async () => {
    const { result, waitFor } = renderHook(() => useNavPages(false), {
      wrapper: makeWrapper(UserTypeEnum.HybridStaff),
    });

    await waitFor(() =>
      expect(result.current.navPages.map((page) => page.id)).toContain(
        'hr-tools-page',
      ),
    );
  });

  it('hides the HR Tools tab for a non-Cru user', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNavPages(false), {
      wrapper: makeWrapper(UserTypeEnum.NonCru),
    });
    await waitForNextUpdate();

    expect(result.current.navPages.map((page) => page.id)).not.toContain(
      'hr-tools-page',
    );
  });

  it('hides the HR Tools tab for a global staff user', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNavPages(false), {
      wrapper: makeWrapper(UserTypeEnum.GlobalStaff),
    });
    await waitForNextUpdate();

    expect(result.current.navPages.map((page) => page.id)).not.toContain(
      'hr-tools-page',
    );
  });
});
