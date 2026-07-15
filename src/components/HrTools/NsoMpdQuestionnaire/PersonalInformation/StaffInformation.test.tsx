import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { StaffInformation } from './StaffInformation';

describe('StaffInformation', () => {
  it("shows the staff member's information from the questionnaire", async () => {
    const { findByRole, getByRole, getByText } = render(
      <NsoMpdQuestionnaireTestWrapper>
        <StaffInformation />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    expect(
      await findByRole('heading', { name: 'John Doe' }),
    ).toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Staff Status' })).toHaveValue(
      'New Staff',
    );
    expect(getByRole('textbox', { name: 'Family Status' })).toHaveValue(
      'Married',
    );
    expect(getByRole('textbox', { name: 'Age' })).toHaveValue('30-34');
    expect(getByRole('textbox', { name: 'Tenure' })).toHaveValue('4');
    expect(getByRole('textbox', { name: 'Address' })).toHaveValue(
      '123 Main St, Apt 4, Miami, FL 33101',
    );
    expect(getByText('Person Number: 000123456')).toBeInTheDocument();
  });

  it("toggles to the spouse's information", async () => {
    const { findByRole, getByRole, getByText } = render(
      <NsoMpdQuestionnaireTestWrapper>
        <StaffInformation />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    userEvent.click(await findByRole('button', { name: 'View Jane' }));

    expect(getByRole('heading', { name: 'Jane Doe' })).toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Age' })).toHaveValue('Under 30');
    expect(getByRole('textbox', { name: 'Tenure' })).toHaveValue('2');
    expect(getByRole('textbox', { name: 'Staff Status' })).toHaveValue(
      'Already on Staff',
    );
    expect(getByText('Person Number: 000789123')).toBeInTheDocument();
  });

  it('shows each person read-only cell phone number', async () => {
    const { findByRole, getByRole } = render(
      <NsoMpdQuestionnaireTestWrapper
        newStaffQuestionnaire={{
          phoneNumber: '(305) 000-1111',
          spousePhoneNumber: '(305) 222-3333',
        }}
      >
        <StaffInformation />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    // Wait for the questionnaire data to load (the name is data-dependent).
    await findByRole('heading', { name: 'John Doe' });

    const phone = getByRole('textbox', { name: 'Cell Phone Number' });
    expect(phone).toHaveValue('(305) 000-1111');
    expect(phone).toHaveAttribute('readonly');

    userEvent.click(getByRole('button', { name: 'View Jane' }));

    expect(getByRole('textbox', { name: 'Cell Phone Number' })).toHaveValue(
      '(305) 222-3333',
    );
  });

  it('hides the spouse toggle and shows Single without a spouse', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <NsoMpdQuestionnaireTestWrapper hasSpouse={false}>
        <StaffInformation />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    expect(
      await findByRole('heading', { name: 'John Doe' }),
    ).toBeInTheDocument();
    expect(queryByRole('button', { name: /View/ })).not.toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Family Status' })).toHaveValue(
      'Single',
    );
  });

  it('shows a "Not on record" placeholder for an empty field', async () => {
    const { findByRole } = render(
      <NsoMpdQuestionnaireTestWrapper
        newStaffQuestionnaire={{ phoneNumber: '' }}
      >
        <StaffInformation />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    const phone = await findByRole('textbox', { name: 'Cell Phone Number' });
    expect(phone).toHaveValue('');
    expect(phone).toHaveAttribute('placeholder', 'Not on record');
  });
});
