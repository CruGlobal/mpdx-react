import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import { GoalCalculatorPage, getServerSideProps } from './index.page';

interface ComponentsProps {
  userType?: UserTypeEnum;
  usStaffGroup?: UsStaffGroupEnum;
}

const Components: React.FC<ComponentsProps> = ({
  userType = UserTypeEnum.NonCru,
  usStaffGroup = UsStaffGroupEnum.SeniorStaff,
}) => (
  <TestRouter>
    <GqlMockedProvider<{
      GetUser: GetUserQuery;
    }>
      mocks={{
        GetUser: { user: { userType, usStaffGroup } },
      }}
    >
      <GoalCalculatorPage />
    </GqlMockedProvider>
  </TestRouter>
);

describe('GoalCalculator page', () => {
  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(<Components />);

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });

  it('should show limited access for a US Staff user whose usStaffGroup is PaidWithDesignation (PDS)', async () => {
    const { findByText } = render(
      <Components
        userType={UserTypeEnum.UsStaff}
        usStaffGroup={UsStaffGroupEnum.PaidWithDesignation}
      />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
