import { fireEvent, render, waitFor } from '@testing-library/react';
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
      </GoalCalculatorTestWrapper>,
    );

    expect(
      getByRole('button', { name: /finish & apply goal/i }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: /save goal without applying/i }),
    ).toBeInTheDocument();
  });

  it('hides both buttons when "Save Goal Without Applying" is clicked', () => {
    const { queryByRole, getByRole } = render(
      <GoalCalculatorTestWrapper>
        <GoalApplicationButtonGroup goal={mockGoal} />
      </GoalCalculatorTestWrapper>,
    );

    const saveWithoutApplyingButton = getByRole('button', {
      name: /save goal without applying/i,
    });
    fireEvent.click(saveWithoutApplyingButton);
    expect(
      queryByRole('button', { name: /finish & apply goal/i }),
    ).not.toBeInTheDocument();
    expect(saveWithoutApplyingButton).not.toBeInTheDocument();
  });

  it('shows loading state when "Finish & Apply Goal" is clicked', async () => {
    const { getByRole } = render(
      <GoalCalculatorTestWrapper>
        <GoalApplicationButtonGroup goal={mockGoal} />
      </GoalCalculatorTestWrapper>,
    );

    const finishButton = getByRole('button', {
      name: /finish & apply goal/i,
    });
    fireEvent.click(finishButton);
    expect(getByRole('button', { name: /saving.../i })).toBeInTheDocument();
    expect(getByRole('progressbar')).toBeInTheDocument();
    expect(finishButton).toBeDisabled();
  });

  it('calls updateAccountPreferences mutation with correct variables', async () => {
    const { findByText, getByRole } = render(
      <GoalCalculatorTestWrapper>
        <GoalApplicationButtonGroup goal={mockGoal} />
      </GoalCalculatorTestWrapper>,
    );

    fireEvent.click(
      getByRole('button', {
        name: /finish & apply goal/i,
      }),
    );
    expect(await findByText(/saved successfully/i)).toBeInTheDocument();
  });

  it('shows success message after successful save', async () => {
    const { findByText, getByRole } = render(
      <GoalCalculatorTestWrapper>
        <GoalApplicationButtonGroup goal={mockGoal} />
      </GoalCalculatorTestWrapper>,
    );

    fireEvent.click(
      getByRole('button', {
        name: /finish & apply goal/i,
      }),
    );

    expect(await findByText(/saved successfully/i)).toBeInTheDocument();
  });

  it('disables button during loading', async () => {
    const { getByRole } = render(
      <GoalCalculatorTestWrapper>
        <GoalApplicationButtonGroup goal={mockGoal} />
      </GoalCalculatorTestWrapper>,
    );

    const finishButton = getByRole('button', {
      name: /finish & apply goal/i,
    });
    fireEvent.click(finishButton);
    expect(finishButton).toBeDisabled();
    await waitFor(() => {
      expect(finishButton).not.toBeDisabled();
    });
  });
});
