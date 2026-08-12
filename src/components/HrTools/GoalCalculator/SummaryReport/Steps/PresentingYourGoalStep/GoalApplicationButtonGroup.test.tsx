import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  GoalCalculatorTestWrapper,
  goalCalculationMock,
} from '../../../GoalCalculatorTestWrapper';
import { GoalApplicationButtonGroup } from './GoalApplicationButtonGroup';

const mutationSpy = jest.fn();
const TestComponent: React.FC<{ geographicLocation?: string | null }> = ({
  geographicLocation,
}) => (
  <GoalCalculatorTestWrapper
    onCall={mutationSpy}
    goalCalculation={
      geographicLocation === undefined
        ? goalCalculationMock
        : { ...goalCalculationMock, geographicLocation }
    }
  >
    <GoalApplicationButtonGroup />
  </GoalCalculatorTestWrapper>
);

describe('GoalApplicationButtonGroup', () => {
  it('renders both buttons initially', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('button', { name: /apply goal to mpdx/i }),
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
      queryByRole('button', { name: /apply goal to mpdx/i }),
    ).not.toBeInTheDocument();
    expect(saveWithoutApplyingButton).not.toBeInTheDocument();
  });

  it('shows loading state when "Apply Goal to MPDX" is clicked', async () => {
    const { getByRole, findByText, queryByRole } = render(<TestComponent />);

    const applyButton = getByRole('button', {
      name: /apply goal to mpdx/i,
    });
    await waitFor(() => expect(applyButton).toBeEnabled());
    userEvent.click(applyButton);

    expect(
      queryByRole('button', { name: /apply goal to mpdx/i }),
    ).not.toBeInTheDocument();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAccountPreferences', {
        input: {
          attributes: {
            id: 'account-list-1',
            settings: { monthlyGoal: 16139 },
          },
          id: 'account-list-1',
        },
      }),
    );

    expect(
      await findByText('Successfully updated your monthly goal to $16,139!'),
    ).toBeInTheDocument();
  });

  it('does not send geographic location when the goal calculation has none', async () => {
    const { getByRole } = render(<TestComponent geographicLocation={null} />);

    const applyButton = getByRole('button', { name: /apply goal to mpdx/i });
    await waitFor(() => expect(applyButton).toBeEnabled());
    userEvent.click(applyButton);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAccountPreferences'),
    );

    const updateCall = mutationSpy.mock.calls.find(
      ([{ operation }]) =>
        operation.operationName === 'UpdateAccountPreferences',
    );
    expect(
      updateCall?.[0].operation.variables.input.attributes.settings,
    ).not.toHaveProperty('geographicLocation');
  });

  it('sends geographicLocation when the goal calculation has one', async () => {
    const { getByRole } = render(
      <TestComponent geographicLocation="Miami, FL" />,
    );

    const applyButton = getByRole('button', { name: /apply goal to mpdx/i });
    await waitFor(() => expect(applyButton).toBeEnabled());
    userEvent.click(applyButton);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAccountPreferences', {
        input: {
          id: 'account-list-1',
          attributes: {
            id: 'account-list-1',
            settings: { geographicLocation: 'Miami, FL' },
          },
        },
      }),
    );
  });
});
