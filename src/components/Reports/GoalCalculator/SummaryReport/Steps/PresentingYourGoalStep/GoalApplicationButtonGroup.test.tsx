import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalCalculatorTestWrapper } from '../../../GoalCalculatorTestWrapper';
import { GoalApplicationButtonGroup } from './GoalApplicationButtonGroup';

const mutationSpy = jest.fn();
const TestComponent: React.FC = () => (
  <GoalCalculatorTestWrapper onCall={mutationSpy}>
    <GoalApplicationButtonGroup />
  </GoalCalculatorTestWrapper>
);

describe('GoalApplicationButtonGroup', () => {
  it('renders both buttons initially', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('button', { name: /finish & apply goal/i }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: /save goal without applying/i }),
    ).toBeInTheDocument();
  });

  it('hides both buttons when "Save Goal Without Applying" is clicked', () => {
    const { queryByRole, getByRole } = render(<TestComponent />);

    const saveWithoutApplyingButton = getByRole('button', {
      name: /save goal without applying/i,
    });
    userEvent.click(saveWithoutApplyingButton);
    expect(
      queryByRole('button', { name: /finish & apply goal/i }),
    ).not.toBeInTheDocument();
    expect(saveWithoutApplyingButton).not.toBeInTheDocument();
  });

  it('shows loading state when "Finish & Apply Goal" is clicked', async () => {
    const { getByRole, findByText, queryByRole } = render(<TestComponent />);

    const applyButton = getByRole('button', {
      name: /finish & apply goal/i,
    });
    await waitFor(() => expect(applyButton).toBeEnabled());
    userEvent.click(applyButton);

    expect(
      queryByRole('button', { name: /finish & apply goal/i }),
    ).not.toBeInTheDocument();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAccountPreferences', {
        input: {
          attributes: {
            id: 'account-list-1',
            settings: { monthlyGoal: 9030 },
          },
          id: 'account-list-1',
        },
      }),
    );

    expect(
      await findByText('Successfully updated your monthly goal to $9,030!'),
    ).toBeInTheDocument();
  });
});
