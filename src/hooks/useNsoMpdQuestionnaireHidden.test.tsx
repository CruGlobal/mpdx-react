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

const userInGroup = (usStaffGroup: UsStaffGroupEnum) => ({
  userType: UserTypeEnum.UsStaff,
  usStaffGroup,
  spouseUsStaffGroup: usStaffGroup,
});

const renderHidden = (
  newStaffQuestionnaire:
    | NewStaffQuestionnaireStatusQuery['newStaffQuestionnaire']
    | (() => never),
  usStaffGroup = UsStaffGroupEnum.NewStaff,
) => {
  const mocks = {
    GetUser: { user: userInGroup(usStaffGroup) },
    UserOption: { userOption: { key: 'user_type_verified', value: 'true' } },
    NewStaffQuestionnaireStatus: { newStaffQuestionnaire },
  } as unknown as DeepPartial<Mocks>;
  const Wrapper = ({ children }: { children: ReactElement }) => (
    <TestRouter>
      <GqlMockedProvider<Mocks> mocks={mocks}>{children}</GqlMockedProvider>
    </TestRouter>
  );
  return renderHook(() => useNsoMpdQuestionnaireHidden(), {
    wrapper: Wrapper,
  });
};

const openQuestionnaire = { id: 'questionnaire-1', completed: false };
const failingQuery = () => {
  throw new Error('Not authorized');
};

describe('useNsoMpdQuestionnaireHidden', () => {
  afterEach(() => {
    process.env.DISABLE_NS_GOAL_CALCULATOR = 'false';
  });

  it('shows it to new staff with one to fill in', async () => {
    const { result } = renderHidden(openQuestionnaire);

    await waitFor(() => expect(result.current).toBe(false));
  });

  it('shows it to a senior staff spouse with one to fill in', async () => {
    const { result } = renderHidden(
      openQuestionnaire,
      UsStaffGroupEnum.SeniorStaff,
    );

    await waitFor(() => expect(result.current).toBe(false));
  });

  it('hides it once the household has completed it', async () => {
    const { result, waitForNextUpdate } = renderHidden({
      ...openQuestionnaire,
      completed: true,
    });
    await waitForNextUpdate();

    expect(result.current).toBe(true);
  });

  it('hides it when the household has none to fill in', async () => {
    const { result, waitForNextUpdate } = renderHidden(null);
    await waitForNextUpdate();

    expect(result.current).toBe(true);
  });

  it('keeps it visible for new staff when the status query fails', async () => {
    const { result } = renderHidden(failingQuery);

    await waitFor(() => expect(result.current).toBe(false));
  });

  it('keeps it hidden from other staff when the status query fails', async () => {
    const { result, waitForNextUpdate } = renderHidden(
      failingQuery,
      UsStaffGroupEnum.SeniorStaff,
    );
    await waitForNextUpdate();

    expect(result.current).toBe(true);
  });

  it('hides it when the New Staff Goal Calculator is turned off', async () => {
    process.env.DISABLE_NS_GOAL_CALCULATOR = 'true';
    const { result, waitForNextUpdate } = renderHidden(openQuestionnaire);
    await waitForNextUpdate();

    expect(result.current).toBe(true);
  });
});
