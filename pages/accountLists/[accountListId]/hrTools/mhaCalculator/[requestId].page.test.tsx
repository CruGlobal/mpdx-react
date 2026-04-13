import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { MinisterHousingAllowanceProvider } from 'src/components/Reports/MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { StaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import {
  UserPreferenceContext,
  UserPreferenceType,
} from 'src/components/User/Preferences/UserPreferenceProvider';
import { UserTypeEnum } from 'src/graphql/types.generated';
import {
  HousingAllowanceRequestPageContent,
  getServerSideProps,
} from './[requestId].page';

const requestId = '123';
const mutationSpy = jest.fn();

const mockStaffAccount = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
      name: 'Test Account',
    },
  },
};

const defaultContext: UserPreferenceType = {
  locale: 'en-US',
  userType: UserTypeEnum.NonCru,
};

const Components = () => (
  <TestRouter>
    <SnackbarProvider>
      <GqlMockedProvider<{
        StaffAccount: StaffAccountQuery;
      }>
        mocks={mockStaffAccount}
        onCall={mutationSpy}
      >
        <UserPreferenceContext.Provider value={defaultContext}>
          <MinisterHousingAllowanceProvider
            type={PageEnum.New}
            requestId={requestId}
          >
            <HousingAllowanceRequestPageContent />
          </MinisterHousingAllowanceProvider>
        </UserPreferenceContext.Provider>
      </GqlMockedProvider>
    </SnackbarProvider>
  </TestRouter>
);

describe('HousingAllowanceRequest page', () => {
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
