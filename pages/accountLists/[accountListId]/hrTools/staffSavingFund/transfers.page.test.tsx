import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import {
  StaffSavingFundTransfersPage,
  getServerSideProps,
} from './transfers.page';

const Components = () => (
  <TestRouter>
    <GqlMockedProvider<{
      GetUser: GetUserQuery;
    }>
      mocks={{
        GetUser: { user: { userType: UserTypeEnum.NonCru } },
      }}
    >
      <StaffSavingFundTransfersPage />
    </GqlMockedProvider>
  </TestRouter>
);

describe('StaffSavingFundTransfers page', () => {
  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(<Components />);

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
