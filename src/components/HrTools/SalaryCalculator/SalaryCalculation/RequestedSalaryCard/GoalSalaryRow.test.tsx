import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
import {
  HcmLoaded,
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../../SalaryCalculatorTestWrapper';
import { goalSalaryCalculations, makeGoal } from '../../Shared/goalSalaryMock';
import { RequestedSalaryCard } from './RequestedSalaryCard';

const TestComponent: React.FC<SalaryCalculatorTestWrapperProps> = (props) => (
  <SalaryCalculatorTestWrapper
    salaryRequestMock={{
      calculations: goalSalaryCalculations,
      spouseCalculations: goalSalaryCalculations,
    }}
    {...props}
  >
    <HcmLoaded />
    <AutosaveForm>
      <RequestedSalaryCard />
    </AutosaveForm>
  </SalaryCalculatorTestWrapper>
);

describe('GoalSalaryRow', () => {
  it("shows each person's salary from their MPD Goal", async () => {
    const { findByRole } = render(<TestComponent goals={[makeGoal('1')]} />);

    const row = await findByRole('row', { name: /MPD Goal Salary/ });
    expect(row).toHaveTextContent('From your goal: Goal 1');
    expect(row).toHaveTextContent('$36,000.00');
    expect(row).toHaveTextContent('$18,000.00');
  });

  it('fills the requested salaries from the goal', async () => {
    const mutationSpy = jest.fn();
    const { findByRole } = render(
      <TestComponent goals={[makeGoal('1')]} onCall={mutationSpy} />,
    );

    userEvent.click(await findByRole('button', { name: 'Use Goal Salary' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateSalaryCalculation', {
        input: {
          attributes: {
            id: 'salary-request-1',
            salary: 36000,
            spouseSalary: 18000,
          },
        },
      }),
    );
  });

  it('is hidden without an MPD Goal', async () => {
    const { findByText, queryByRole } = render(<TestComponent />);

    expect(await findByText('HCM loaded')).toBeInTheDocument();
    expect(
      queryByRole('row', { name: /MPD Goal Salary/ }),
    ).not.toBeInTheDocument();
  });
});
