import React from 'react';
import { TextField } from '@mui/material';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as yup from 'yup';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { useQuestionnaireAutoSave } from './useQuestionnaireAutoSave';

const TestComponent: React.FC = () => {
  const schema = yup.object({
    phoneNumber: yup.string().min(7, 'Too short'),
  });
  const props = useQuestionnaireAutoSave({
    fieldName: 'phoneNumber',
    schema,
  });
  return <TextField label="Field" {...props} />;
};

describe('useQuestionnaireAutoSave', () => {
  it('starts empty when there is no loaded questionnaire', () => {
    const { getByRole } = render(
      <NsoMpdQuestionnaireTestWrapper onCall={jest.fn()}>
        <TestComponent />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    expect(getByRole('textbox', { name: 'Field' })).toHaveValue('');
  });

  it('seeds the field from the loaded questionnaire', async () => {
    const { findByDisplayValue } = render(
      <NsoMpdQuestionnaireTestWrapper
        onCall={jest.fn()}
        newStaffQuestionnaire={{ phoneNumber: '305-111-2222' }}
      >
        <TestComponent />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    expect(await findByDisplayValue('305-111-2222')).toBeInTheDocument();
  });

  it('surfaces the schema validation error for an invalid value once touched', () => {
    const { getByRole, getByText } = render(
      <NsoMpdQuestionnaireTestWrapper onCall={jest.fn()}>
        <TestComponent />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    userEvent.type(getByRole('textbox', { name: 'Field' }), '123');
    userEvent.tab();

    expect(getByText('Too short')).toBeInTheDocument();
  });

  it('saves a valid value through the upsert on blur', async () => {
    const mutationSpy = jest.fn();
    const { getByRole } = render(
      <NsoMpdQuestionnaireTestWrapper onCall={mutationSpy}>
        <TestComponent />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    const input = getByRole('textbox', { name: 'Field' });
    userEvent.type(input, '305-555-1234');
    userEvent.tab();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateNewStaffQuestionnaire',
        {
          input: {
            accountListId: 'account-list-1',
            attributes: { phoneNumber: '305-555-1234' },
          },
        },
      ),
    );
  });
});
