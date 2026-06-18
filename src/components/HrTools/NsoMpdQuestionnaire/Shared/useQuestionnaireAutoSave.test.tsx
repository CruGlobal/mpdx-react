import React from 'react';
import { TextField } from '@mui/material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as yup from 'yup';
import { useQuestionnaireAutoSave } from './useQuestionnaireAutoSave';

const TestComponent: React.FC = () => {
  const schema = yup.object({
    field: yup.string().min(7, 'Too short'),
  });

  const props = useQuestionnaireAutoSave({ fieldName: 'field', schema });

  return <TextField label="Field" {...props} />;
};

describe('useQuestionnaireAutoSave', () => {
  it('starts empty without an error', () => {
    const { getByRole, queryByText } = render(<TestComponent />);

    expect(getByRole('textbox', { name: 'Field' })).toHaveValue('');
    expect(queryByText('Too short')).not.toBeInTheDocument();
  });

  it('stores typed values in local state', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Field' });
    userEvent.type(input, '1234567890');

    expect(input).toHaveValue('1234567890');
  });

  it('surfaces the schema validation error for an invalid value once touched', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    userEvent.type(getByRole('textbox', { name: 'Field' }), '123');
    userEvent.tab();

    expect(getByText('Too short')).toBeInTheDocument();
  });

  it('clears the error once the value becomes valid', () => {
    const { getByRole, queryByText } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Field' });
    userEvent.type(input, '1234567');

    expect(queryByText('Too short')).not.toBeInTheDocument();
  });
});
