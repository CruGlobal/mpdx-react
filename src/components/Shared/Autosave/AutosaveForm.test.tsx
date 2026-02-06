import React from 'react';
import { TextField } from '@mui/material';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as yup from 'yup';
import i18next from 'src/lib/i18n';
import { amount } from 'src/lib/yupHelpers';
import { AutosaveForm, useAutosaveForm } from './AutosaveForm';
import { useAutoSave } from './useAutosave';

const schema = yup.object({
  field1: amount('field', i18next.t, { max: 100 }),
  field2: amount('field', i18next.t, { max: 200 }),
});

const saveValue = jest.fn().mockResolvedValue(undefined);

interface AutosaveTextField {
  fieldName: string;
}

const AutosaveTextField: React.FC<AutosaveTextField> = ({ fieldName }) => {
  const props = useAutoSave({
    value: 0,
    saveValue,
    fieldName,
    schema,
  });

  return <TextField label={fieldName} {...props} />;
};

const Status: React.FC = () => {
  const { allValid } = useAutosaveForm();

  return <h1>{allValid ? 'Valid' : 'Invalid'}</h1>;
};

const TestComponent: React.FC = () => (
  <AutosaveForm>
    <AutosaveTextField fieldName="field1" />
    <AutosaveTextField fieldName="field2" />
    <Status />
  </AutosaveForm>
);

describe('AutosaveForm', () => {
  it('tracks valid and invalid fields', async () => {
    const { getByRole } = render(<TestComponent />);

    const input1 = getByRole('textbox', { name: 'field1' });
    userEvent.clear(input1);
    userEvent.type(input1, '50');
    input1.blur();

    const input2 = getByRole('textbox', { name: 'field2' });
    userEvent.clear(input2);
    userEvent.type(input2, '100');
    input2.blur();

    userEvent.clear(input1);
    userEvent.type(input1, '250');
    input1.blur();
    await waitFor(() =>
      expect(getByRole('heading')).toHaveTextContent('Invalid'),
    );

    userEvent.clear(input1);
    userEvent.type(input1, '75');
    input1.blur();

    await waitFor(() =>
      expect(getByRole('heading')).toHaveTextContent('Valid'),
    );
  });
});
