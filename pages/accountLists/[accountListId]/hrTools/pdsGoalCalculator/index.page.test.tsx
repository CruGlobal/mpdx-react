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
import PdsGoalCalculatorPage, { getServerSideProps } from './index.page';

interface ComponentsProps {
  userType?: UserTypeEnum;
  peopleGroupSupportType?: PeopleGroupSupportTypeEnum;
}

const Components: React.FC<ComponentsProps> = ({
  userType = UserTypeEnum.UsStaff,
  peopleGroupSupportType = PeopleGroupSupportTypeEnum.Designation,
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
      <PdsGoalCalculatorPage />
    </GqlMockedProvider>
  </TestRouter>
);

describe('PdsGoalCalculator page', () => {
  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('should show limited access for a non-Cru user', async () => {
    const { findByText } = render(
      <Components userType={UserTypeEnum.NonCru} />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });

  it('should show limited access for a US Staff user whose peopleGroupSupportType is SupportedRmo (Senior)', async () => {
    const { findByText } = render(
      <Components
        userType={UserTypeEnum.UsStaff}
        peopleGroupSupportType={PeopleGroupSupportTypeEnum.SupportedRmo}
      />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
