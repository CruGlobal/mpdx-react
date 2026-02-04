import React from 'react';
import { MenuItem, TextField } from '@mui/material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as yup from 'yup';
import i18next from 'src/lib/i18n';
import { amount } from 'src/lib/yupHelpers';
import { useAutoSave } from './useAutosave';

const defaultSchema = yup.object({
  field: amount('Field', i18next.t),
});

const saveValue = jest.fn().mockResolvedValue(undefined);

interface TestComponentProps {
  disabled?: boolean;
  schema?: yup.Schema;
}

const TestComponent: React.FC<TestComponentProps> = ({
  disabled = false,
  schema = defaultSchema,
}) => {
  const props = useAutoSave({
    value: 100,
    saveValue,
    fieldName: 'field',
    schema,
    disabled,
  });

  return <TextField label="Field" {...props} />;
};

const SelectTestComponent: React.FC = () => {
  const props = useAutoSave({
    value: 100,
    saveValue,
    fieldName: 'field',
    schema: defaultSchema,
    saveOnChange: true,
  });

  return (
    <TextField label="Field" select {...props}>
      <MenuItem value={-100}>-100</MenuItem>
      <MenuItem value={100}>100</MenuItem>
      <MenuItem value={200}>200</MenuItem>
    </TextField>
  );
};

describe('AutosaveTextField', () => {
  it('initializes with value and no errors', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Field' });

    expect(input).toHaveValue('100');
    expect(input).toHaveAccessibleDescription('');
  });

  it('saves value on blur', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Field' });
    userEvent.clear(input);
    userEvent.type(input, '200');
    input.blur();

    expect(saveValue).toHaveBeenCalledWith(200);
  });

  it('saves null value', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Field' });
    userEvent.clear(input);
    input.blur();

    expect(saveValue).toHaveBeenCalledWith(null);
  });

  it('does not save when value does not change', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Field' });
    input.focus();
    input.blur();

    expect(saveValue).not.toHaveBeenCalled();
  });

  it('shows validation error', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Field' });
    userEvent.clear(input);
    userEvent.type(input, '-100');
    expect(input).toHaveAccessibleDescription('Field must be positive');

    input.blur();

    expect(saveValue).not.toHaveBeenCalled();
  });

  it('disables the input and pauses validation when disabled', () => {
    const schema = yup.object({
      field: amount('field', i18next.t).required(),
    });
    const { getByRole } = render(<TestComponent disabled schema={schema} />);

    const input = getByRole('textbox', { name: 'Field' });
    expect(input).toBeDisabled();
    expect(input).toHaveAccessibleDescription('');
  });

  it('shows validation error for invalid type', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Field' });
    userEvent.clear(input);
    userEvent.type(input, 'abc');
    expect(input).toHaveAccessibleDescription('Field must be a number');
  });

  describe('select input', () => {
    it('saves on change', () => {
      const { getByRole } = render(<SelectTestComponent />);

      const input = getByRole('combobox', { name: 'Field' });
      userEvent.click(input);
      userEvent.click(getByRole('option', { name: '200' }));

      expect(saveValue).toHaveBeenCalledWith(200);
    });

    it('shows validation error', () => {
      const { getByRole } = render(<SelectTestComponent />);

      const input = getByRole('combobox', { name: 'Field' });
      userEvent.click(input);
      userEvent.click(getByRole('option', { name: '-100' }));

      expect(input).toHaveAccessibleDescription('Field must be positive');
      expect(saveValue).not.toHaveBeenCalled();
    });
  });
});
