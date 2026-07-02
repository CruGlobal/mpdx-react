import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { PhoneNumberField } from './PhoneNumberField';

const TestComponent: React.FC<{
  onCall?: MockLinkCallHandler;
  fieldName?: 'phoneNumber' | 'spousePhoneNumber';
}> = ({ onCall, fieldName = 'phoneNumber' }) => (
  <NsoMpdQuestionnaireTestWrapper onCall={onCall}>
    <PhoneNumberField fieldName={fieldName} label="Cell phone number" />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('PhoneNumberField', () => {
  it('renders a required cell phone number field', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Cell phone number' });
    expect(input).toBeInTheDocument();
    expect(input).toBeRequired();
  });

  it('seeds the value from the loaded questionnaire', async () => {
    const { findByDisplayValue } = render(
      <NsoMpdQuestionnaireTestWrapper
        newStaffQuestionnaire={{ phoneNumber: '(305) 111-2222' }}
      >
        <PhoneNumberField fieldName="phoneNumber" label="Cell phone number" />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    expect(await findByDisplayValue('(305) 111-2222')).toBeInTheDocument();
  });

  it('saves phoneNumber through the upsert on blur', async () => {
    const mutationSpy = jest.fn();
    const { getByRole } = render(<TestComponent onCall={mutationSpy} />);

    const input = getByRole('textbox', { name: 'Cell phone number' });
    userEvent.clear(input);
    userEvent.type(input, '(123) 456-7890');
    userEvent.tab();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateNewStaffQuestionnaire',
        {
          input: {
            accountListId: 'account-list-1',
            attributes: { phoneNumber: '(123) 456-7890' },
          },
        },
      ),
    );
  });

  it('saves spousePhoneNumber when bound to the spouse field', async () => {
    const mutationSpy = jest.fn();
    const { getByRole } = render(
      <TestComponent onCall={mutationSpy} fieldName="spousePhoneNumber" />,
    );

    const input = getByRole('textbox', { name: 'Cell phone number' });
    userEvent.clear(input);
    userEvent.type(input, '(123) 456-7890');
    userEvent.tab();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateNewStaffQuestionnaire',
        {
          input: {
            attributes: { spousePhoneNumber: '(123) 456-7890' },
          },
        },
      ),
    );
  });

  it('strips disallowed characters as the user types', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Cell phone number' });
    userEvent.clear(input);
    userEvent.type(input, 'abc(123) 456-7890xyz');

    expect(input).toHaveValue('(123) 456-7890');
  });

  it('shows a validation error for too few digits on blur', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Cell phone number' });
    userEvent.clear(input);
    userEvent.type(input, '123');
    userEvent.tab();

    expect(getByText('Invalid phone number')).toBeInTheDocument();
  });
});
