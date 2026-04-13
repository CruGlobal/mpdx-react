import React from 'react';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { SalaryCalculatorTestWrapper } from 'src/components/Reports/SalaryCalculator/SalaryCalculatorTestWrapper';
import { StaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import {
  UserPreferenceContext,
  UserPreferenceType,
} from 'src/components/User/Preferences/UserPreferenceProvider';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { SalaryCalculatorEditPage } from './index.page';

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
  userType: UserTypeEnum.UsStaff,
};

interface ComponentProps {
  contextValue: UserPreferenceType;
}

const Components: React.FC<ComponentProps> = ({ contextValue }) => (
  <GqlMockedProvider<{
    StaffAccount: StaffAccountQuery;
  }>
    mocks={mockStaffAccount}
    onCall={mutationSpy}
  >
    <UserPreferenceContext.Provider value={contextValue}>
      <SalaryCalculatorTestWrapper>
        <SalaryCalculatorEditPage />
      </SalaryCalculatorTestWrapper>
    </UserPreferenceContext.Provider>
  </GqlMockedProvider>
);

describe('SalaryCalculatorEditPage', () => {
  it('renders Saving indicator', async () => {
    const { findByText } = render(<Components contextValue={defaultContext} />);

    expect(await findByText(/Last saved/)).toBeInTheDocument();
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(
      <Components
        contextValue={{ ...defaultContext, userType: UserTypeEnum.NonCru }}
      />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
