import React from 'react';
import { MenuItem } from '@mui/material';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as yup from 'yup';
import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { PdsGoalCalculatorTestWrapper } from '../../PdsGoalCalculatorTestWrapper';
import { AutosaveTextField } from './AutosaveTextField';

const schema = yup.object({
  name: yup.string().required('Goal Name is required'),
  status: yup.string().nullable(),
  payRate: yup.number().nullable().min(0, 'Pay Rate must be a positive number'),
});

const mutationSpy = jest.fn();

const calculationMock = {
  id: 'goal-1',
  name: 'Test Goal',
  status: DesignationSupportStatus.FullTime,
  salaryOrHourly: DesignationSupportSalaryType.Salaried,
  payRate: 50000,
  hoursWorkedPerWeek: null,
  benefits: 1500,
  geographicLocation: null,
};

interface TestComponentProps {
  fieldName?: 'name' | 'status' | 'payRate';
  select?: boolean;
  children?: React.ReactNode;
}

const TestComponent: React.FC<TestComponentProps> = ({
  fieldName = 'name',
  select,
  children,
}) => (
  <PdsGoalCalculatorTestWrapper
    calculationMock={calculationMock}
    onCall={mutationSpy}
  >
    <AutosaveTextField
      label="Test Field"
      fieldName={fieldName}
      schema={schema}
      select={select}
    >
      {children}
    </AutosaveTextField>
  </PdsGoalCalculatorTestWrapper>
);

describe('AutosaveTextField', () => {
  it('saves value on blur', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Test Field' });
    await waitFor(() => expect(input).toHaveValue('Test Goal'));

    userEvent.clear(input);
    userEvent.type(input, 'New Name');
    input.blur();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: {
          id: 'goal-1',
          name: 'New Name',
        },
      }),
    );
  });

  it('does not save when value does not change', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Test Field' });
    await waitFor(() => expect(input).toHaveValue('Test Goal'));

    input.focus();
    input.blur();

    await waitFor(() => expect(input).not.toHaveFocus());

    await waitFor(() =>
      expect(mutationSpy).not.toHaveGraphqlOperation(
        'UpdatePdsGoalCalculation',
      ),
    );
  });

  it('shows validation error for negative numbers', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={calculationMock}
        onCall={mutationSpy}
      >
        <AutosaveTextField
          label="Pay Rate"
          fieldName="payRate"
          schema={schema}
          type="number"
        />
      </PdsGoalCalculatorTestWrapper>,
    );

    const input = await findByRole('spinbutton', { name: 'Pay Rate' });
    await waitFor(() => expect(input).toHaveValue(50000));

    userEvent.clear(input);
    userEvent.type(input, '-100');

    expect(input).toHaveAccessibleDescription(
      'Pay Rate must be a positive number',
    );
  });

  it('is disabled when calculation is not loaded', () => {
    const { getByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={undefined}
        onCall={mutationSpy}
      >
        <AutosaveTextField
          label="Test Field"
          fieldName="name"
          schema={schema}
        />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(getByRole('textbox', { name: 'Test Field' })).toBeDisabled();
  });

  it('merges disabled prop with field disabled state', () => {
    const { getByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={calculationMock}
        onCall={mutationSpy}
      >
        <AutosaveTextField
          label="Test Field"
          fieldName="name"
          schema={schema}
          disabled
        />
      </PdsGoalCalculatorTestWrapper>,
    );

    const input = getByRole('textbox', { name: 'Test Field' });
    expect(input).toBeDisabled();
  });

  describe('select input', () => {
    it('saves on change', async () => {
      const { getByRole } = render(
        <TestComponent fieldName="status" select>
          <MenuItem value={DesignationSupportStatus.FullTime}>
            Full-time
          </MenuItem>
          <MenuItem value={DesignationSupportStatus.PartTime}>
            Part-time
          </MenuItem>
        </TestComponent>,
      );

      const input = getByRole('combobox', { name: 'Test Field' });
      await waitFor(() => expect(input).toHaveTextContent('Full-time'));

      userEvent.click(input);
      userEvent.click(getByRole('option', { name: 'Part-time' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
          attributes: {
            id: 'goal-1',
            status: DesignationSupportStatus.PartTime,
          },
        }),
      );
    });
  });
});
