import React from 'react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { HcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import {
  PeopleGroupSupportTypeEnum,
  UserTypeEnum,
} from 'src/graphql/types.generated';
import {
  GoalCalculatorPage,
  getServerSideProps,
} from './[goalCalculationId].page';

interface ComponentsProps {
  userType?: UserTypeEnum;
  peopleGroupSupportType?: PeopleGroupSupportTypeEnum;
}

const Components: React.FC<ComponentsProps> = ({
  userType = UserTypeEnum.NonCru,
  peopleGroupSupportType = PeopleGroupSupportTypeEnum.SupportedRmo,
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
              staffInfo: { peopleGroupSupportType },
            },
          ],
        },
      }}
    >
      <GoalCalculatorPage />
    </GqlMockedProvider>
  </TestRouter>
);

describe('[goalCalculationId] page', () => {
  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(<Components />);

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });

  it('should show limited access for a US Staff user whose peopleGroupSupportType is Designation (PDS)', async () => {
    const { findByText } = render(
      <Components
        userType={UserTypeEnum.UsStaff}
        peopleGroupSupportType={PeopleGroupSupportTypeEnum.Designation}
      />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
