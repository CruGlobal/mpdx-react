import React from 'react';
import { render } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from 'src/components/Reports/SalaryCalculator/SalaryCalculatorTestWrapper';
import {
  UserPreferenceContext,
  UserPreferenceType,
} from 'src/components/User/Preferences/UserPreferenceProvider';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { SalaryCalculatorEditPage } from './index.page';

const defaultContext: UserPreferenceType = {
  locale: 'en-US',
  userType: UserTypeEnum.UsStaff,
};

interface ComponentProps {
  contextValue: UserPreferenceType;
}

const Components: React.FC<ComponentProps> = ({ contextValue }) => (
  <UserPreferenceContext.Provider value={contextValue}>
    <SalaryCalculatorTestWrapper>
      <SalaryCalculatorEditPage />
    </SalaryCalculatorTestWrapper>
  </UserPreferenceContext.Provider>
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
