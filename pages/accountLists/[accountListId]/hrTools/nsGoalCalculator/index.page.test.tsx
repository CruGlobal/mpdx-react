import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  expectedGuardOutcomes,
  impersonationGuardOutcomes,
} from '__tests__/util/impersonationGuard';
import { render } from '__tests__/util/testingLibraryReactMock';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import { ImpersonationArea } from 'src/lib/impersonationAccess';
import theme from 'src/theme';
import { NsGoalCalculatorPage, getServerSideProps } from './index.page';

interface TestComponentProps {
  userType?: UserTypeEnum;
  usStaffGroup?: UsStaffGroupEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({
  userType = UserTypeEnum.UsStaff,
  usStaffGroup = UsStaffGroupEnum.NewStaff,
}) => (
  <TestRouter>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        GetUser: GetUserQuery;
      }>
        mocks={{
          GetUser: { user: { userType, usStaffGroup } },
        }}
      >
        <NsGoalCalculatorPage />
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('NsGoalCalculator page', () => {
  it('guards server-side props by impersonator role', async () => {
    expect(await impersonationGuardOutcomes(getServerSideProps)).toEqual(
      expectedGuardOutcomes(ImpersonationArea.NsGoalCalculator),
    );
  });

  it('renders the calculator when the user is eligible (New Staff)', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Review Your Calculation' }),
    ).toBeInTheDocument();
  });

  it('shows limited access when the user is ineligible', async () => {
    const { findByText } = render(
      <TestComponent usStaffGroup={UsStaffGroupEnum.PaidWithDesignation} />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
