import { ReactElement } from 'react';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react-hooks';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import { NewStaffQuestionnaireStatusQuery } from './NewStaffQuestionnaireStatus.generated';
import { UserOptionQuery } from './UserPreference.generated';
import { useNsoMpdQuestionnaireHidden } from './useNsoMpdQuestionnaireHidden';

type Mocks = {
  GetUser: GetUserQuery;
  UserOption: UserOptionQuery;
  NewStaffQuestionnaireStatus: NewStaffQuestionnaireStatusQuery;
};

const mutationSpy = jest.fn();

interface RenderOptions {
  usStaffGroup?: UsStaffGroupEnum;
  userGroupVerified?: boolean;
}

const renderHidden = (
  newStaffQuestionnaire:
    | NewStaffQuestionnaireStatusQuery['newStaffQuestionnaire']
    | (() => never),
  {
    usStaffGroup = UsStaffGroupEnum.NewStaff,
    userGroupVerified = true,
  }: RenderOptions = {},
) => {
  const mocks = {
    GetUser: {
      user: {
        userType: UserTypeEnum.UsStaff,
        usStaffGroup,
        spouseUsStaffGroup: usStaffGroup,
      },
    },
    UserOption: {
      userOption: {
        key: 'user_type_verified',
        value: userGroupVerified ? 'true' : 'false',
      },
    },
    NewStaffQuestionnaireStatus: { newStaffQuestionnaire },
  } as unknown as DeepPartial<Mocks>;
  const Wrapper = ({ children }: { children: ReactElement }) => (
    <TestRouter>
      <GqlMockedProvider<Mocks> mocks={mocks} onCall={mutationSpy}>
        {children}
      </GqlMockedProvider>
    </TestRouter>
  );
  return renderHook(() => useNsoMpdQuestionnaireHidden(), {
    wrapper: Wrapper,
  });
};

/** Waits for the status query itself, so a hidden result is the hook's answer and not its loading state. */
const statusQueried = () =>
  waitFor(() =>
    expect(mutationSpy).toHaveGraphqlOperation('NewStaffQuestionnaireStatus'),
  );

const openQuestionnaire = { id: 'questionnaire-1', completed: false };
const failingQuery = () => {
  throw new Error('Not authorized');
};

describe('useNsoMpdQuestionnaireHidden', () => {
  const originalFlag = process.env.DISABLE_NS_GOAL_CALCULATOR;

  afterEach(() => {
    process.env.DISABLE_NS_GOAL_CALCULATOR = originalFlag;
  });

  it('shows it to new staff with one to fill in', async () => {
    const { result } = renderHidden(openQuestionnaire);

    await waitFor(() => expect(result.current).toBe(false));
  });

  it('shows it to a senior staff spouse with one to fill in', async () => {
    const { result } = renderHidden(openQuestionnaire, {
      usStaffGroup: UsStaffGroupEnum.SeniorStaff,
    });

    await waitFor(() => expect(result.current).toBe(false));
  });

  it('hides it once the household has completed it', async () => {
    const { result } = renderHidden({
      ...openQuestionnaire,
      completed: true,
    });
    await statusQueried();

    await waitFor(() => expect(result.current).toBe(true));
  });

  it('hides it when the household has none to fill in', async () => {
    const { result } = renderHidden(null);
    await statusQueried();

    await waitFor(() => expect(result.current).toBe(true));
  });

  it('keeps it visible for new staff when the status query fails', async () => {
    const { result } = renderHidden(failingQuery);

    await waitFor(() => expect(result.current).toBe(false));
  });

  it('keeps it hidden from other staff when the status query fails', async () => {
    const { result } = renderHidden(failingQuery, {
      usStaffGroup: UsStaffGroupEnum.SeniorStaff,
    });
    await statusQueried();

    await waitFor(() => expect(result.current).toBe(true));
  });

  it('hides it until the user confirms their user group', async () => {
    const { result } = renderHidden(openQuestionnaire, {
      userGroupVerified: false,
    });
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UserOption'),
    );

    await waitFor(() => expect(result.current).toBe(true));
  });

  it('hides it, without asking, when the New Staff Goal Calculator is turned off', async () => {
    process.env.DISABLE_NS_GOAL_CALCULATOR = 'true';
    const { result, waitForNextUpdate } = renderHidden(openQuestionnaire);
    await waitForNextUpdate();

    expect(result.current).toBe(true);
    expect(mutationSpy).not.toHaveGraphqlOperation(
      'NewStaffQuestionnaireStatus',
    );
  });
});
