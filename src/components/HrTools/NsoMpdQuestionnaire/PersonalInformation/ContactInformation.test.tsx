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
  it('renders a required phone field for the user and the spouse', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    const spousePhone = await findByRole('textbox', {
      name: "Jane's Cell Phone Number",
    });
    const userPhone = getByRole('textbox', {
      name: 'Your Cell Phone Number',
    });

    expect(userPhone).toBeRequired();
    expect(spousePhone).toBeRequired();
  });

  it('has a column for the user and the spouse', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('columnheader', { name: 'Jane' }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'John' })).toBeInTheDocument();
    expect(
      getByRole('rowheader', { name: 'Cell Phone Number' }),
    ).toBeInTheDocument();
  });

  it('only shows the user column without a spouse', async () => {
    const { findByRole, queryByRole } = render(
      <NsoMpdQuestionnaireTestWrapper hasSpouse={false}>
        <ContactInformation />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    expect(
      await findByRole('columnheader', { name: 'John' }),
    ).toBeInTheDocument();
    expect(
      queryByRole('columnheader', { name: 'Jane' }),
    ).not.toBeInTheDocument();
    expect(
      queryByRole('textbox', { name: "Jane's Cell Phone Number" }),
    ).not.toBeInTheDocument();
  });

  it("saves the user's phone number on blur", async () => {
    const mutationSpy = jest.fn();
    const { findByRole } = render(<TestComponent onCall={mutationSpy} />);

    const input = await findByRole('textbox', {
      name: 'Your Cell Phone Number',
    });
    userEvent.clear(input);
    userEvent.type(input, '(123) 456-7890');
    userEvent.tab();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateNewStaffQuestionnaire',
        {
          input: {
            attributes: { phoneNumber: '(123) 456-7890' },
          },
        },
      ),
    );
  });

  it("saves the spouse's phone number on blur", async () => {
    const mutationSpy = jest.fn();
    const { findByRole } = render(<TestComponent onCall={mutationSpy} />);

    const input = await findByRole('textbox', {
      name: "Jane's Cell Phone Number",
    });
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

  it('seeds each phone number from the loaded questionnaire', async () => {
    const { findByDisplayValue } = render(
      <NsoMpdQuestionnaireTestWrapper
        newStaffQuestionnaire={{
          phoneNumber: '(305) 111-2222',
          spousePhoneNumber: '(305) 333-4444',
        }}
      >
        <ContactInformation />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    expect(await findByDisplayValue('(305) 111-2222')).toBeInTheDocument();
    expect(await findByDisplayValue('(305) 333-4444')).toBeInTheDocument();
  });

  it('shows a validation error for too few digits on blur', async () => {
    const { findByRole, getByText } = render(<TestComponent />);

    const input = await findByRole('textbox', {
      name: 'Your Cell Phone Number',
    });
    userEvent.clear(input);
    userEvent.type(input, '123');
    userEvent.tab();

    expect(getByText('Invalid phone number')).toBeInTheDocument();
  });
});
