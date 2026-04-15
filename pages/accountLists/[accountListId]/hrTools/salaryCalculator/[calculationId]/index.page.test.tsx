import React from 'react';
import { render } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from 'src/components/Reports/SalaryCalculator/SalaryCalculatorTestWrapper';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { SalaryCalculatorEditOuterPage } from './index.page';

interface ComponentProps {
  userType?: UserTypeEnum;
}

const Components: React.FC<ComponentProps> = ({
  userType = UserTypeEnum.UsStaff,
}) => (
  <SalaryCalculatorTestWrapper userType={userType}>
    <SalaryCalculatorEditOuterPage />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryCalculatorEditPage', () => {
  it('renders Saving indicator', async () => {
    const { findByText } = render(<Components />);

    expect(await findByText(/Last saved/)).toBeInTheDocument();
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(
      <Components userType={UserTypeEnum.NonCru} />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
