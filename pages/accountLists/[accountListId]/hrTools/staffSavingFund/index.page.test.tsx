import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  expectedGuardOutcomes,
  impersonationGuardOutcomes,
} from '__tests__/util/impersonationGuard';
import { render } from '__tests__/util/testingLibraryReactMock';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { ImpersonationArea } from 'src/lib/impersonationAccess';
import { StaffSavingFundPage, getServerSideProps } from './index.page';

const Components = () => (
  <TestRouter>
    <GqlMockedProvider<{
      GetUser: GetUserQuery;
    }>
      mocks={{
        GetUser: { user: { userType: UserTypeEnum.NonCru } },
      }}
    >
      <StaffSavingFundPage />
    </GqlMockedProvider>
  </TestRouter>
);

describe('StaffSavingFund page', () => {
  it('guards server-side props by impersonator role', async () => {
    expect(await impersonationGuardOutcomes(getServerSideProps)).toEqual(
      expectedGuardOutcomes(ImpersonationArea.StaffSavingFund),
    );
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(<Components />);

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
