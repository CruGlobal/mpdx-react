import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { currentYear, makeGoal } from '../../Shared/goalSalaryMock';
import {
  LandingTestWrapper,
  LandingTestWrapperProps,
} from './LandingTestWrapper';
import { NewSalaryCalculatorLanding } from './NewSalaryCalculatorLanding';

const mutationSpy = jest.fn();

const TestComponent: React.FC<LandingTestWrapperProps> = (props) => (
  <LandingTestWrapper {...props} onCall={mutationSpy}>
    <NewSalaryCalculatorLanding />
  </LandingTestWrapper>
);

describe('NewSalaryCalculatorLanding MPD Goal salary', () => {
  it('starts a new calculation at the MPD Goal salary', async () => {
    const { findByRole } = render(
      <TestComponent hasApprovedCalculation goals={[makeGoal('1')]} />,
    );

    userEvent.click(
      await findByRole('button', { name: 'Calculate New Salary' }),
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateSalaryCalculation', {
        input: {
          attributes: {
            id: 'new-calculation',
            salary: 36000,
            spouseSalary: 18000,
          },
        },
      }),
    );
  });

  it('keeps the prefilled salary without an MPD Goal from this year', async () => {
    const push = jest.fn();
    const { findByRole } = render(
      <TestComponent
        hasApprovedCalculation
        goals={[makeGoal('1', { calculationsYear: currentYear - 1 })]}
        push={push}
      />,
    );

    userEvent.click(
      await findByRole('button', { name: 'Calculate New Salary' }),
    );

    // It navigates only after any auto-fill has run
    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(mutationSpy).toHaveGraphqlOperation('CreateSalaryCalculation');
    expect(mutationSpy).not.toHaveGraphqlOperation('UpdateSalaryCalculation');
  });
});
