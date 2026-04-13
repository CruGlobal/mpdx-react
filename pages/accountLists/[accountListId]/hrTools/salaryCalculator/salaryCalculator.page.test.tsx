import React from 'react';
import { render } from '@testing-library/react';
import { UserTypeEnum } from 'pages/api/graphql-rest.page.generated';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { LandingTestWrapper } from 'src/components/Reports/SalaryCalculator/Landing/NewSalaryCalculationLanding/LandingTestWrapper';
import { SalaryCalculatorTestWrapper } from 'src/components/Reports/SalaryCalculator/SalaryCalculatorTestWrapper';
import {
  UserPreferenceContext,
  UserPreferenceType,
} from 'src/components/User/Preferences/UserPreferenceProvider';
import SalaryCalculatorPage, { getServerSideProps } from './index.page';

const defaultContext: UserPreferenceType = {
  locale: 'en-US',
  userType: UserTypeEnum.UsStaff,
};

interface TestComponentProps {
  contextValue: UserPreferenceType;
}

const TestComponent: React.FC<TestComponentProps> = ({ contextValue }) => (
  <SalaryCalculatorTestWrapper>
    <UserPreferenceContext.Provider value={contextValue}>
      <SalaryCalculatorPage />
    </UserPreferenceContext.Provider>
  </SalaryCalculatorTestWrapper>
);

describe('SalaryCalculatorPage', () => {
  it('renders the Salary Calculator header', async () => {
    const { findByRole } = render(
      <TestComponent contextValue={defaultContext} />,
    );
    expect(
      await findByRole('heading', { name: /Salary Calculator/i }),
    ).toBeInTheDocument();
  });

  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  describe('conditional rendering', () => {
    it('renders PendingSalaryCalculationLanding when shouldShowPending is true', async () => {
      const { findByRole } = render(
        <LandingTestWrapper hasLatestCalculation>
          <UserPreferenceContext.Provider value={defaultContext}>
            <SalaryCalculatorPage />
          </UserPreferenceContext.Provider>
        </LandingTestWrapper>,
      );

      expect(
        await findByRole('heading', { name: 'Your Salary Calculation Form' }),
      ).toBeInTheDocument();
    });

    it('renders NewSalaryCalculatorLanding when shouldShowPending is false', async () => {
      const { findByRole } = render(
        <LandingTestWrapper>
          <UserPreferenceContext.Provider value={defaultContext}>
            <SalaryCalculatorPage />
          </UserPreferenceContext.Provider>
        </LandingTestWrapper>,
      );

      expect(
        await findByRole('heading', { name: 'Salary Calculator' }),
      ).toBeInTheDocument();
    });
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(
      <TestComponent
        contextValue={{ ...defaultContext, userType: UserTypeEnum.NonCru }}
      />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
