import React from 'react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { HcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import {
  PeopleGroupSupportTypeEnum,
  UserPersonTypeEnum,
  UserTypeEnum,
} from 'src/graphql/types.generated';
import { PdsGoalCalculatorPage, getServerSideProps } from './[pdsGoalId].page';

interface AccessComponentsProps {
  userType?: UserTypeEnum;
  peopleGroupSupportType?: PeopleGroupSupportTypeEnum;
  userPersonType?: UserPersonTypeEnum;
}

const AccessComponents: React.FC<AccessComponentsProps> = ({
  userType = UserTypeEnum.UsStaff,
  peopleGroupSupportType = PeopleGroupSupportTypeEnum.Designation,
  userPersonType = UserPersonTypeEnum.EmployeeHourly,
}) => (
  <TestRouter>
    <GqlMockedProvider<{
      GetUser: GetUserQuery;
      Hcm: HcmQuery;
    }>
      mocks={{
        GetUser: { user: { userType } },
        Hcm: {
          hcm: [
            {
              staffInfo: { peopleGroupSupportType, userPersonType },
            },
          ],
        },
      }}
    >
      <PdsGoalCalculatorPage />
    </GqlMockedProvider>
  </TestRouter>
);

describe('[pdsGoalId] page', () => {
  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('should show limited access for a non-Cru user', async () => {
    const { findByText } = render(
      <AccessComponents userType={UserTypeEnum.NonCru} />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });

  it('should show limited access for a US Staff user whose peopleGroupSupportType is SupportedRmo (Senior)', async () => {
    const { findByText } = render(
      <AccessComponents
        userType={UserTypeEnum.UsStaff}
        peopleGroupSupportType={PeopleGroupSupportTypeEnum.SupportedRmo}
      />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });

  // TODO: follow-up PR will replace the hardcoded MPD/PDS goal calc gating with a backend
  // eligibility check, at which point the inner-content "renders Saving indicator" test should
  // be restored.
  it('shows limited access for an otherwise PDS-eligible US Staff user (gating hardcoded)', async () => {
    const { findByText } = render(
      <AccessComponents
        userType={UserTypeEnum.UsStaff}
        peopleGroupSupportType={PeopleGroupSupportTypeEnum.Designation}
        userPersonType={UserPersonTypeEnum.EmployeeHourly}
      />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
