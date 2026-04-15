import React from 'react';
import { render } from '@testing-library/react';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { LandingTestWrapper } from 'src/components/Reports/SalaryCalculator/Landing/NewSalaryCalculationLanding/LandingTestWrapper';
import { SalaryCalculatorTestWrapper } from 'src/components/Reports/SalaryCalculator/SalaryCalculatorTestWrapper';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { SalaryCalculatorOuterPage, getServerSideProps } from './index.page';

interface TestComponentProps {
  userType?: UserTypeEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({
  userType = UserTypeEnum.UsStaff,
}) => (
  <SalaryCalculatorTestWrapper userType={userType}>
    <SalaryCalculatorOuterPage />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryCalculatorPage', () => {
  it('renders the Salary Calculator header', async () => {
    const { findByRole } = render(<TestComponent />);
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
          <SalaryCalculatorOuterPage />
        </LandingTestWrapper>,
      );

      expect(
        await findByRole('heading', { name: 'Your Salary Calculation Form' }),
      ).toBeInTheDocument();
    });

    it('renders NewSalaryCalculatorLanding when shouldShowPending is false', async () => {
      const { findByRole } = render(
        <LandingTestWrapper>
          <SalaryCalculatorOuterPage />
        </LandingTestWrapper>,
      );

      expect(
        await findByRole('heading', { name: 'Salary Calculator' }),
      ).toBeInTheDocument();
    });
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(
      <TestComponent userType={UserTypeEnum.NonCru} />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
