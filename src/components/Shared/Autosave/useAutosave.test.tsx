import React from 'react';
import { MenuItem, TextField } from '@mui/material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as yup from 'yup';
import i18n from 'src/lib/i18n';
import { amount } from 'src/lib/yupHelpers';
import { useAutoSave } from './useAutosave';

const saveValue = jest.fn().mockResolvedValue(undefined);

interface TestComponentProps {
  disabled?: boolean;
  required?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  disabled = false,
  required = false,
}) => {
  const schema = yup.object({
    field: amount('Field', i18n.t, { required }),
  });

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
  const schema = yup.object({
    field: amount('Field', i18n.t),
  });

  const props = useAutoSave({
    value: 100,
    saveValue,
    fieldName: 'field',
    schema,
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

const SaveOnChangeTextComponent: React.FC = () => {
  const schema = yup.object({
    field: amount('Field', i18n.t, { required: true }),
  });

  const props = useAutoSave({
    value: 100,
    saveValue,
    fieldName: 'field',
    schema,
    saveOnChange: true,
  });

  return <TextField label="Field" {...props} />;
};

const TouchedTestComponent: React.FC = () => {
  const schema = yup.object({
    field: amount('Field', i18n.t, { required: true }),
  });

  const props = useAutoSave({
    value: null,
    saveValue,
    fieldName: 'field',
    schema,
  });

  return <TextField label="Field" {...props} />;
};

const TransformTestComponent: React.FC = () => {
  const schema = yup.object({
    field: yup.string().transform((val) => val.replace(/\D/g, '')),
  });

  const props = useAutoSave({
    value: '',
    saveValue,
    fieldName: 'field',
    schema,
  });

  return <TextField label="Field" {...props} />;
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

  it('shows validation error after blur', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Field' });
    userEvent.clear(input);
    userEvent.type(input, '-100');
    userEvent.tab();

    expect(input).toHaveAccessibleDescription('Field must be positive');
    expect(saveValue).not.toHaveBeenCalled();
  });

  it('disables the input and pauses validation when disabled', () => {
    const { getByRole } = render(<TestComponent disabled required />);

    const input = getByRole('textbox', { name: 'Field' });
    expect(input).toBeDisabled();
    expect(input).toHaveAccessibleDescription('');
  });

  it('shows validation error for invalid type after blur', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Field' });
    userEvent.clear(input);
    userEvent.type(input, 'abc');
    userEvent.tab();

    expect(input).toHaveAccessibleDescription('Field must be a number');
  });

  it('transforms the input value', () => {
    const { getByRole } = render(<TransformTestComponent />);

    const input = getByRole('textbox', { name: 'Field' });
    userEvent.type(input, 'a1b2c3');

    expect(input).toHaveValue('123');
  });

  describe('error visibility', () => {
    it('hides the validation error until the field is blurred', () => {
      const { getByRole } = render(<TouchedTestComponent />);

      const input = getByRole('textbox', { name: 'Field' });
      expect(input).toHaveAccessibleDescription('');

      input.focus();
      userEvent.tab();

      expect(input).toHaveAccessibleDescription('Field is required');
    });

    it('does not show the validation error while the user types', () => {
      const { getByRole } = render(<TouchedTestComponent />);

      const input = getByRole('textbox', { name: 'Field' });
      userEvent.type(input, '-100');
      expect(input).toHaveAccessibleDescription('');

      userEvent.tab();

      expect(input).toHaveAccessibleDescription('Field must be positive');
    });

    it('shows the validation error while typing when saveOnChange is true', () => {
      const { getByRole } = render(<SaveOnChangeTextComponent />);

      const input = getByRole('textbox', { name: 'Field' });
      userEvent.clear(input);
      userEvent.type(input, '-100');

      expect(input).toHaveAccessibleDescription('Field must be positive');
    });
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
