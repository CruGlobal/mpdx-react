import React from 'react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { PdsGoalCalculatorTestWrapper } from 'src/components/HrTools/PdsGoalCalculator/PdsGoalCalculatorTestWrapper';
import { HcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { PdsGoalCalculatorPage, getServerSideProps } from './[pdsGoalId].page';

interface AccessComponentsProps {
  userType?: UserTypeEnum;
  designationSupportCalculatorEligible?: boolean;
}

const AccessComponents: React.FC<AccessComponentsProps> = ({
  userType = UserTypeEnum.UsStaff,
  designationSupportCalculatorEligible = true,
}) => (
  <TestRouter>
    <GqlMockedProvider<{
      GetUser: GetUserQuery;
      Hcm: HcmQuery;
    }>
      mocks={{
        GetUser: { user: { userType } },
        Hcm: {
          hcm: [{ designationSupportCalculatorEligible }],
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

  it('should show limited access when designationSupportCalculatorEligible is false', async () => {
    const { findByText } = render(
      <AccessComponents designationSupportCalculatorEligible={false} />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });

  it('renders Saving indicator for an eligible US Staff user', async () => {
    const { findByText } = render(
      <PdsGoalCalculatorTestWrapper<{
        Hcm: HcmQuery;
      }>
        withProvider={false}
        userMock={{ user: { userType: UserTypeEnum.UsStaff } }}
        extraMocks={{
          Hcm: {
            hcm: [{ designationSupportCalculatorEligible: true }],
          },
        }}
      >
        <PdsGoalCalculatorPage />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByText(/Last saved/)).toBeInTheDocument();
  });
});
