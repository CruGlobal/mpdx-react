import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { NewStaffQuestionnaireStatusQuery } from './NewStaffQuestionnaireStatus.generated';
import { UserOptionQuery } from './UserPreference.generated';
import { useNavPages } from './useNavPages';

const accountListId = 'account-list-1';

// Wrapper for asserting HR Tools visibility by user type (verified, reports enabled).
// The household is in no open training unless a questionnaire is passed.
const makeWrapper = (
  userType: UserTypeEnum,
  userTypeVerified = 'true',
  newStaffQuestionnaire: NewStaffQuestionnaireStatusQuery['newStaffQuestionnaire'] = null,
) => {
  const wrapper = ({ children }: { children: ReactElement }) => (
    <TestRouter router={{ query: { accountListId }, isReady: true }}>
      <GqlMockedProvider<{
        GetUser: GetUserQuery;
        UserOption: UserOptionQuery;
        NewStaffQuestionnaireStatus: NewStaffQuestionnaireStatusQuery;
      }>
        mocks={{
          GetUser: { user: { userType } },
          UserOption: {
            userOption: { key: 'user_type_verified', value: userTypeVerified },
          },
          NewStaffQuestionnaireStatus: { newStaffQuestionnaire },
        }}
      >
        {children}
      </GqlMockedProvider>
    </TestRouter>
  );
  wrapper.displayName = 'NavPagesWrapper';
  return wrapper;
};

const nonUsStaffUser = {
  userType: UserTypeEnum.GlobalStaff,
  usStaffGroup: null,
  spouseUsStaffGroup: null,
  staffAccountId: null,
};

const Wrapper = ({ children }: { children: ReactElement }) => (
  <TestRouter>
    <GqlMockedProvider<{ GetUser: GetUserQuery; UserOption: UserOptionQuery }>
      mocks={{
        GetUser: { user: nonUsStaffUser },
        UserOption: {
          userOption: { key: 'user_type_verified', value: 'true' },
        },
      }}
    >
      {children}
    </GqlMockedProvider>
  </TestRouter>
);

const ReportsDisabledWrapper = ({ children }: { children: ReactElement }) => (
  <TestRouter>
    <GqlMockedProvider<{ GetUser: GetUserQuery; UserOption: UserOptionQuery }>
      mocks={{
        GetUser: { user: nonUsStaffUser },
        UserOption: {
          userOption: { key: 'user_type_verified', value: 'false' },
        },
      }}
    >
      {children}
    </GqlMockedProvider>
  </TestRouter>
);

describe('useNavPages', () => {
  afterEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
  });

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

  it('hides the HR Tools tab for a non-US Staff user when not in a development env', async () => {
    mockSession({ developer: false });

    const { result, waitForNextUpdate } = renderHook(() => useNavPages(false), {
      wrapper: Wrapper,
    });
    await waitForNextUpdate();

    expect(result.current.navPages.map((page) => page.id)).not.toContain(
      'hr-tools-page',
    );
  });

  it('hides the HR Tools tab for a non-US Staff non-developer in a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: false });

    const { result, waitForNextUpdate } = renderHook(() => useNavPages(false), {
      wrapper: Wrapper,
    });
    await waitForNextUpdate();

    expect(result.current.navPages.map((page) => page.id)).not.toContain(
      'hr-tools-page',
    );
  });

  it('shows the HR Tools tab for a non-US Staff developer in a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: true });

    const { result, waitForNextUpdate } = renderHook(() => useNavPages(false), {
      wrapper: Wrapper,
    });
    await waitForNextUpdate();

    expect(result.current.navPages.map((page) => page.id)).toContain(
      'hr-tools-page',
    );
  });

  it('shows the HR Tools tab for a developer when reports are disabled', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: true });

    const { result, waitFor } = renderHook(() => useNavPages(false), {
      wrapper: ReportsDisabledWrapper,
    });

    await waitFor(() =>
      expect(result.current.navPages.map((page) => page.id)).toContain(
        'hr-tools-page',
      ),
    );
  });

  it('hides the HR Tools tab when reports are disabled and there is no questionnaire', async () => {
    mockSession({ developer: false });

    const { result, waitForNextUpdate } = renderHook(() => useNavPages(false), {
      wrapper: makeWrapper(UserTypeEnum.UsStaff, 'false'),
    });
    await waitForNextUpdate();

    expect(result.current.navPages.map((page) => page.id)).not.toContain(
      'hr-tools-page',
    );
  });

  it('shows the HR Tools tab with only the questionnaire before the user group is confirmed', async () => {
    mockSession({ developer: false });

    const { result, waitFor } = renderHook(() => useNavPages(false), {
      wrapper: makeWrapper(UserTypeEnum.UsStaff, 'false', {
        id: 'questionnaire-1',
        completed: false,
      }),
    });

    await waitFor(() =>
      expect(
        result.current.navPages
          .find((page) => page.id === 'hr-tools-page')
          ?.items?.map((item) => item.id),
      ).toEqual(['nsoMpdQuestionnaire']),
    );
  });
});
