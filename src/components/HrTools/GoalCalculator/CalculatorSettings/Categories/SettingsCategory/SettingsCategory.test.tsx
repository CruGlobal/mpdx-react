import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalCalculatorTestWrapper } from '../../../GoalCalculatorTestWrapper';
import { SettingsCategory } from './SettingsCategory';

const mutationSpy = jest.fn();

const TestComponent: React.FC<{ readOnly?: boolean }> = ({ readOnly }) => (
  <GoalCalculatorTestWrapper onCall={mutationSpy} readOnly={readOnly}>
    <SettingsCategory />
  </GoalCalculatorTestWrapper>
);

describe('SettingsCategory', () => {
  it('renders goal title input field', () => {
    const { getByRole } = render(<TestComponent />);
    expect(getByRole('textbox', { name: 'Goal Name' })).toBeInTheDocument();
  });

  it('displays initial goal title from query after loading', async () => {
    const { getByRole } = render(<TestComponent />);
    const input = getByRole('textbox', { name: 'Goal Name' });
    await waitFor(() => expect(input).toHaveValue('Initial Goal Name'));
  });

  it('calls mutation on blur with valid input', async () => {
    const { getByRole } = render(<TestComponent />);
    const input = getByRole('textbox', { name: 'Goal Name' });

    await waitFor(() => expect(input).toHaveValue('Initial Goal Name'));

    userEvent.clear(input);
    userEvent.type(input, 'Valid Goal');
    userEvent.tab();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
        input: {
          accountListId: 'account-list-1',
          attributes: {
            id: 'goal-calculation-1',
            name: 'Valid Goal',
          },
        },
      }),
    );
  });

  it('handles onChange successfully', async () => {
    const { getByRole } = render(<TestComponent />);
    const input = getByRole('textbox', { name: 'Goal Name' });

    await waitFor(() => expect(input).toHaveValue('Initial Goal Name'));
    userEvent.type(input, ' Updated');
    expect(input).toHaveValue('Initial Goal Name Updated');
  });

  describe('calculation year', () => {
    it('shows the saved calculation year', async () => {
      const { getByRole } = render(<TestComponent />);

      const yearSelect = getByRole('combobox', { name: 'Calculation Year' });
      await waitFor(() => expect(yearSelect).toHaveTextContent('2019'));
    });

    it('offers the years from the creation year through the current year', async () => {
      const { getByRole, getAllByRole } = render(<TestComponent />);

      const yearSelect = getByRole('combobox', { name: 'Calculation Year' });
      await waitFor(() => expect(yearSelect).toHaveTextContent('2019'));

      userEvent.click(yearSelect);
      expect(
        getAllByRole('option').map((option) => option.textContent),
      ).toEqual(['2020', '2019', '2018']);
    });

    it('saves the selected year', async () => {
      const { getByRole } = render(<TestComponent />);

      const yearSelect = getByRole('combobox', { name: 'Calculation Year' });
      await waitFor(() => expect(yearSelect).toHaveTextContent('2019'));

      userEvent.click(yearSelect);
      userEvent.click(getByRole('option', { name: '2020' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'goal-calculation-1',
              calculationsYear: 2020,
            },
          },
        }),
      );
    });

    it('explains the year in a tooltip', async () => {
      const { findByRole, findByText } = render(<TestComponent />);

      userEvent.hover(
        await findByRole('button', { name: 'About the calculation year' }),
      );

      expect(
        await findByText(
          'Benefits charges, geographic multipliers, base salary, and other constants change from year to year, which slightly increases most goals. Choose which year to calculate this goal with.',
        ),
      ).toBeInTheDocument();
    });

    it("recalculates the goal with the selected year's constants", async () => {
      const { getByRole } = render(<TestComponent />);

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('GoalCalculatorConstants', {
          year: 2019,
        }),
      );

      const yearSelect = getByRole('combobox', { name: 'Calculation Year' });
      await waitFor(() => expect(yearSelect).toHaveTextContent('2019'));

      userEvent.click(yearSelect);
      userEvent.click(getByRole('option', { name: '2020' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('GoalCalculatorConstants', {
          year: 2020,
        }),
      );
    });

    it('is locked when the goal is read-only', async () => {
      const { findByRole } = render(<TestComponent readOnly />);

      await waitFor(async () =>
        expect(
          await findByRole('combobox', { name: 'Calculation Year' }),
        ).toHaveAttribute('aria-disabled', 'true'),
      );
    });
  });
});
