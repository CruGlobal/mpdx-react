import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalCalculatorTestWrapper } from '../../../GoalCalculatorTestWrapper';
import { GoalApplicationButtonGroup } from './GoalApplicationButtonGroup';

const mockGoal = {
  netMonthlySalary: 6000,
  taxesPercentage: 0.2,
  rothContributionPercentage: 0.1,
  traditionalContributionPercentage: 0.04,
  ministryExpenses: {
    benefitsCharge: 2000,
    ministryMileage: 300,
    medicalMileage: 50,
    medicalExpenses: 300,
    ministryPartnerDevelopment: 200,
    communications: 100,
    entertainment: 200,
    staffDevelopment: 50,
    supplies: 50,
    technology: 50,
    travel: 200,
    transfers: 100,
    other: 200,
  },
};

describe('GoalApplicationButtonGroup', () => {
  it('renders both buttons initially', () => {
    const { getByRole } = render(
      <GoalCalculatorTestWrapper>
        <GoalApplicationButtonGroup goal={mockGoal} />
      </GoalCalculatorTestWrapper>
    );

    expect(
      getByRole('button', { name: /finish & apply goal/i })
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: /save goal without applying/i })
    ).toBeInTheDocument();
  });

  it('hides both buttons when "Save Goal Without Applying" is clicked', () => {
    const { queryByRole, getByRole } = render(
      <GoalCalculatorTestWrapper>
        <GoalApplicationButtonGroup goal={mockGoal} />
      </GoalCalculatorTestWrapper>
    );

    const saveWithoutApplyingButton = getByRole('button', {
      name: /save goal without applying/i,
    });
    userEvent.click(saveWithoutApplyingButton);
    expect(
      queryByRole('button', { name: /finish & apply goal/i })
    ).not.toBeInTheDocument();
    expect(saveWithoutApplyingButton).not.toBeInTheDocument();
  });

  it('shows loading state when "Finish & Apply Goal" is clicked', async () => {
    const mutationSpy = jest.fn();
    const { getByRole, findByText, queryByRole } = render(
      <GoalCalculatorTestWrapper onCall={mutationSpy}>
        <GoalApplicationButtonGroup goal={mockGoal} />
      </GoalCalculatorTestWrapper>
    );

    const finishButton = getByRole('button', {
      name: /finish & apply goal/i,
    });

    userEvent.click(finishButton);

    expect(
      queryByRole('button', { name: /finish & apply goal/i })
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAccountPreferences', {
        input: {
          attributes: {
            id: 'account-list-1',
            settings: { monthlyGoal: 14575 },
          },
          id: 'account-list-1',
        },
      });
    });

    expect(
      await findByText(/Successfully updated your monthly goal to \$14,575!/i)
    ).toBeInTheDocument();
  });
});
