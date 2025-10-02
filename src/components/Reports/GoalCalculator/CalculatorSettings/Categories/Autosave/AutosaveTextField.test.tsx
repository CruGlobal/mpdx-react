import React from 'react';
import { MenuItem } from '@mui/material';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as yup from 'yup';
import i18n from 'src/lib/i18n';
import { GoalCalculatorTestWrapper } from '../../../GoalCalculatorTestWrapper';
import { amount } from '../InformationCategory/schema';
import { AutosaveTextField } from './AutosaveTextField';

const schema = yup.object({
  mhaAmount: amount('MHA Amount', i18n.t),
});

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <GoalCalculatorTestWrapper onCall={mutationSpy}>
    <AutosaveTextField
      label="MHA Amount"
      fieldName="mhaAmount"
      schema={schema}
    />
  </GoalCalculatorTestWrapper>
);

const SelectTestComponent: React.FC = () => (
  <GoalCalculatorTestWrapper onCall={mutationSpy}>
    <AutosaveTextField
      label="MHA Amount"
      fieldName="mhaAmount"
      schema={schema}
      select
    >
      <MenuItem value={-100}>-100</MenuItem>
      <MenuItem value={1000}>1000</MenuItem>
      <MenuItem value={2000}>2000</MenuItem>
      <MenuItem value={3000}>3000</MenuItem>
    </AutosaveTextField>
  </GoalCalculatorTestWrapper>
);

describe('AutosaveTextField', () => {
  it('initializes with value and no errors', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'MHA Amount' });
    await waitFor(() => expect(input).toHaveValue('1000'));

    expect(input).toHaveAccessibleDescription('');
  });

  it('saves value on blur', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'MHA Amount' });
    await waitFor(() => expect(input).toHaveValue('1000'));

    userEvent.clear(input);
    userEvent.type(input, '2000');
    input.blur();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
        input: {
          accountListId: 'account-list-1',
          attributes: {
            id: 'goal-calculation-1',
            mhaAmount: 2000,
          },
        },
      }),
    );
  });

  it('saves null value', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'MHA Amount' });
    await waitFor(() => expect(input).toHaveValue('1000'));

    userEvent.clear(input);
    input.blur();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
        input: {
          accountListId: 'account-list-1',
          attributes: {
            id: 'goal-calculation-1',
            mhaAmount: null,
          },
        },
      }),
    );
  });

  it('does not save when value does not change', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'MHA Amount' });
    await waitFor(() => expect(input).toHaveValue('1000'));

    input.focus();
    input.blur();

    await Promise.resolve();
    await waitFor(() =>
      expect(mutationSpy).not.toHaveGraphqlOperation('UpdateGoalCalculation'),
    );
  });

  it('shows validation error', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'MHA Amount' });
    await waitFor(() => expect(input).toHaveValue('1000'));

    userEvent.clear(input);
    userEvent.type(input, '-100');
    expect(input).toHaveAccessibleDescription('MHA Amount must be positive');

    input.blur();

    await Promise.resolve();
    await waitFor(() =>
      expect(mutationSpy).not.toHaveGraphqlOperation('UpdateGoalCalculation'),
    );
  });

  it('shows validation error for invalid type', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'MHA Amount' });
    await waitFor(() => expect(input).toHaveValue('1000'));

    userEvent.clear(input);
    userEvent.type(input, 'abc');
    expect(input).toHaveAccessibleDescription('MHA Amount must be a number');
  });

  describe('select input', () => {
    it('saves on change', async () => {
      const { getByRole } = render(<SelectTestComponent />);

      const input = getByRole('combobox', { name: 'MHA Amount' });
      await waitFor(() => expect(input).toHaveTextContent('1000'));

      userEvent.click(input);
      userEvent.click(getByRole('option', { name: '2000' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'goal-calculation-1',
              mhaAmount: 2000,
            },
          },
        }),
      );
    });

    it('shows validation error', async () => {
      const { getByRole } = render(<SelectTestComponent />);

      const input = getByRole('combobox', { name: 'MHA Amount' });
      await waitFor(() => expect(input).toHaveTextContent('1000'));

      userEvent.click(input);
      userEvent.click(getByRole('option', { name: '-100' }));

      expect(input).toHaveAccessibleDescription('MHA Amount must be positive');
      await Promise.resolve();
      await waitFor(() =>
        expect(mutationSpy).not.toHaveGraphqlOperation('UpdateGoalCalculation'),
      );
    });
  });
});
