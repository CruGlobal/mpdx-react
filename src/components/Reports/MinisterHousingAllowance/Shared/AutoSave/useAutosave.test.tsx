import React from 'react';
import { TextField } from '@mui/material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as yup from 'yup';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import {
  ContextType,
  MinisterHousingAllowanceContext,
} from '../Context/MinisterHousingAllowanceContext';
import { useAutoSave } from './useAutosave';

const setFieldValue = jest.fn();
const setFieldTouched = jest.fn();

const requiredNumber = () =>
  yup
    .number()
    .typeError('Field must be a number')
    .required('Field is required');

const defaultSchema = yup.object({
  rentalValue: requiredNumber(),
});

const saveValue = jest.fn().mockResolvedValue(undefined);

interface TestComponentProps {
  disabled?: boolean;
  schema?: yup.Schema;
  submitCount?: number;
}

const TestComponent: React.FC<TestComponentProps> = ({
  disabled = false,
  schema = defaultSchema,
  submitCount = 0,
}) => {
  const props = useAutoSave({
    value: 50,
    saveValue,
    fieldName: 'rentalValue',
    schema,
    setFieldValue,
    setFieldTouched,
    submitCount,
    disabled,
  });

  return <TextField label="Rental Value" {...props} />;
};

describe('useAutoSave', () => {
  it('initializes with value and no errors', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: /rental value/i });
    expect(input).toHaveValue('$50.00');
    expect(input).toHaveAccessibleDescription('');
  });

  it('shows validation error on blur if invalid', async () => {
    const { getByRole, findByText } = render(<TestComponent />);

    const input = getByRole('textbox', { name: /rental value/i });
    await userEvent.clear(input);
    await userEvent.tab();

    expect(await findByText('Field is required')).toBeInTheDocument();
    expect(setFieldValue).toHaveBeenCalledWith('rentalValue', null);
    expect(setFieldTouched).toHaveBeenCalledWith('rentalValue', true, true);
  });

  it('saves valid value on blur', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: /rental value/i });
    await userEvent.clear(input);
    await userEvent.type(input, '75');
    await userEvent.tab();

    expect(input).toHaveValue('$75.00');

    expect(saveValue).toHaveBeenCalledWith(75);
    expect(setFieldValue).toHaveBeenCalledWith('rentalValue', 75);
    expect(setFieldTouched).toHaveBeenCalledWith('rentalValue', true, true);
  });

  it('saves null value', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: /rental value/i });
    await userEvent.clear(input);
    input.blur();

    expect(input).toHaveValue('');

    expect(saveValue).toHaveBeenCalledWith(null);
    expect(setFieldValue).toHaveBeenCalledWith('rentalValue', null);
    expect(setFieldTouched).toHaveBeenCalledWith('rentalValue', true, true);
  });

  it('does not save when value does not change', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: /rental value/i });
    input.focus();
    input.blur();

    expect(saveValue).not.toHaveBeenCalled();
  });

  it('disables the input and pauses validation when disabled', () => {
    const { getByRole } = render(<TestComponent disabled />);

    const input = getByRole('textbox', { name: /rental value/i });
    expect(input).toBeDisabled();
    expect(input).toHaveAccessibleDescription('');
  });

  it('shows validation error when submitCount increases', async () => {
    const { getByRole, findByText, rerender } = render(
      <TestComponent submitCount={0} />,
    );

    const input = getByRole('textbox', { name: /rental value/i });
    await userEvent.clear(input);

    rerender(<TestComponent submitCount={1} />);
    expect(await findByText('Field is required')).toBeInTheDocument();
  });

  it('does not update when no attributes changed', async () => {
    const mutationSpy = jest.fn().mockResolvedValue(undefined);

    const { getByRole } = render(
      <GqlMockedProvider onCall={mutationSpy}>
        <MinisterHousingAllowanceContext.Provider
          value={
            {
              pageType: PageEnum.New,
              requestData: {
                id: 'request-id',
                requestAttributes: { rentalValue: 50 },
              },
            } as unknown as ContextType
          }
        >
          <TestComponent />
        </MinisterHousingAllowanceContext.Provider>
      </GqlMockedProvider>,
    );

    const input = getByRole('textbox', { name: /rental value/i });
    await userEvent.clear(input);
    await userEvent.type(input, '50');
    await userEvent.tab();

    expect(mutationSpy).not.toHaveBeenCalled();
  });
});
