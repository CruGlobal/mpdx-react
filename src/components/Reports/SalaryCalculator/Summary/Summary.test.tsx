import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { SummaryStep } from './Summary';

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <SummaryStep />
  </SalaryCalculatorTestWrapper>
);

describe('SummaryStep', () => {
  describe('View Complete Calculations button', () => {
    it('should toggle calculation cards', () => {
      const { getByRole, getByText, queryByText } = render(<TestComponent />);

      const button = getByRole('button', {
        name: 'View Complete Calculations',
      });

      userEvent.click(button);
      expect(getByText('Salary Cap Calculation')).toBeInTheDocument();

      userEvent.click(button);
      expect(queryByText('Salary Cap Calculation')).not.toBeInTheDocument();
    });
  });
});
