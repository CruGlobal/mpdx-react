import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { ContactInformation } from './ContactInformation';

const TestComponent: React.FC<{ onCall?: MockLinkCallHandler }> = ({
  onCall,
}) => (
  <NsoMpdQuestionnaireTestWrapper onCall={onCall}>
    <ContactInformation />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('ContactInformation', () => {
  it('renders the cell phone number field', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('textbox', { name: 'Cell Phone Number' }),
    ).toBeInTheDocument();
  });

  it('marks the cell phone number field as required', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('textbox', { name: 'Cell Phone Number' })).toBeRequired();
  });

  it('saves the cell phone number through the upsert on blur', async () => {
    const mutationSpy = jest.fn();
    const { getByRole } = render(<TestComponent onCall={mutationSpy} />);

    const input = getByRole('textbox', { name: 'Cell Phone Number' });
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

  it('seeds the cell phone number from the loaded questionnaire', async () => {
    const { findByDisplayValue } = render(
      <NsoMpdQuestionnaireTestWrapper
        newStaffQuestionnaire={{ phoneNumber: '(305) 111-2222' }}
      >
        <ContactInformation />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    expect(await findByDisplayValue('(305) 111-2222')).toBeInTheDocument();
  });

  it('strips disallowed characters as the user types', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Cell Phone Number' });
    userEvent.type(input, 'abc(123) 456-7890xyz');

    expect(input).toHaveValue('(123) 456-7890');
  });

  it('shows a validation error for too few digits on blur', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Cell Phone Number' });
    userEvent.type(input, '123');
    userEvent.tab();

    expect(getByText('Invalid phone number')).toBeInTheDocument();
  });

  it('accepts a valid number without error', () => {
    const { getByRole, queryByText } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Cell Phone Number' });
    userEvent.type(input, '(123) 456-7890');
    userEvent.tab();

    expect(queryByText('Invalid phone number')).not.toBeInTheDocument();
  });
});
