import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { DeepPartial } from 'ts-essentials';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { HcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import {
  UsStaffGroupEnum,
  UserPersonTypeEnum,
} from 'src/graphql/types.generated';
import { NsoMpdScenarioEnum, useHouseholdStaff } from './useHouseholdStaff';

type HcmPersonMock = DeepPartial<HcmQuery['hcm'][number]>;
type UserMock = DeepPartial<GetUserQuery['user']>;

const staff: HcmPersonMock = {
  staffInfo: { userPersonType: UserPersonTypeEnum.EmployeeStaff },
};
// In a SOSA household the non-RMO marker sits on the user's own (hcm[0]) record.
const userWithNonRmoSpouse: HcmPersonMock = {
  staffInfo: { userPersonType: UserPersonTypeEnum.EmployeeStaffNonRmoSpouse },
};

const renderHousehold = (hcm: HcmPersonMock[], user: UserMock) =>
  renderHook(() => useHouseholdStaff(), {
    wrapper: ({ children }: { children: ReactElement }) => (
      <GqlMockedProvider<{ Hcm: HcmQuery; GetUser: GetUserQuery }>
        mocks={{ Hcm: { hcm }, GetUser: { user } }}
      >
        {children}
      </GqlMockedProvider>
    ),
  });

describe('useHouseholdStaff', () => {
  it('reports a single new-staff user (NewUserSingle)', async () => {
    const { result, waitForNextUpdate } = renderHousehold([staff], {
      usStaffGroup: UsStaffGroupEnum.NewStaff,
      spouseUsStaffGroup: null,
    });
    await waitForNextUpdate();

    expect(result.current.hasSpouse).toBe(false);
    expect(result.current.hcmSpouse).toBeNull();
    expect(result.current.userStaffGroup).toBe(UsStaffGroupEnum.NewStaff);
    expect(result.current.spouseStaffGroup).toBeNull();
    expect(result.current.hasNonRmoSpouse).toBe(false);
    expect(result.current.scenario).toBe(NsoMpdScenarioEnum.NewUserSingle);
  });

  it('reports two new-staff spouses (NewUserNewSpouse)', async () => {
    const { result, waitForNextUpdate } = renderHousehold([staff, staff], {
      usStaffGroup: UsStaffGroupEnum.NewStaff,
      spouseUsStaffGroup: UsStaffGroupEnum.NewStaff,
    });
    await waitForNextUpdate();

    expect(result.current.hasSpouse).toBe(true);
    expect(result.current.scenario).toBe(NsoMpdScenarioEnum.NewUserNewSpouse);
  });

  it('reports a new user with a senior-staff spouse (NewUserSeniorSpouse)', async () => {
    const { result, waitForNextUpdate } = renderHousehold([staff, staff], {
      usStaffGroup: UsStaffGroupEnum.NewStaff,
      spouseUsStaffGroup: UsStaffGroupEnum.SeniorStaff,
    });
    await waitForNextUpdate();

    expect(result.current.scenario).toBe(
      NsoMpdScenarioEnum.NewUserSeniorSpouse,
    );
  });

  it('reports a senior user with a new-staff spouse (SeniorUserNewSpouse)', async () => {
    const { result, waitForNextUpdate } = renderHousehold([staff, staff], {
      usStaffGroup: UsStaffGroupEnum.SeniorStaff,
      spouseUsStaffGroup: UsStaffGroupEnum.NewStaff,
    });
    await waitForNextUpdate();

    expect(result.current.scenario).toBe(
      NsoMpdScenarioEnum.SeniorUserNewSpouse,
    );
  });

  it('reports a new user with a non-RMO spouse (NewSosaUser)', async () => {
    const { result, waitForNextUpdate } = renderHousehold(
      [userWithNonRmoSpouse, staff],
      {
        usStaffGroup: UsStaffGroupEnum.NewStaff,
        spouseUsStaffGroup: UsStaffGroupEnum.NewStaff,
      },
    );
    await waitForNextUpdate();

    expect(result.current.hasSpouse).toBe(true);
    expect(result.current.hasNonRmoSpouse).toBe(true);
    expect(result.current.scenario).toBe(NsoMpdScenarioEnum.NewSosaUser);
  });

  it('falls back to Unknown for audiences outside the questionnaire (senior single)', async () => {
    const { result, waitForNextUpdate } = renderHousehold([staff], {
      usStaffGroup: UsStaffGroupEnum.SeniorStaff,
      spouseUsStaffGroup: null,
    });
    await waitForNextUpdate();

    expect(result.current.scenario).toBe(NsoMpdScenarioEnum.Unknown);
  });
});
