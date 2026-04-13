import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { UserTypeEnum } from 'pages/api/graphql-rest.page.generated';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import {
  UserPreferenceContext,
  UserPreferenceType,
} from 'src/components/User/Preferences/UserPreferenceProvider';
import { StaffSavingFundPage, getServerSideProps } from './index.page';

const defaultContext: UserPreferenceType = {
  locale: 'en-US',
  userType: UserTypeEnum.NonCru,
};

const Components = () => (
  <TestRouter>
    <GqlMockedProvider>
      <UserPreferenceContext.Provider value={defaultContext}>
        <StaffSavingFundPage />
      </UserPreferenceContext.Provider>
    </GqlMockedProvider>
  </TestRouter>
);

describe('StaffSavingFund page', () => {
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
