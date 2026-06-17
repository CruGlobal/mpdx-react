import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { StaffInformation } from './StaffInformation';

describe('StaffInformation', () => {
  it("shows the staff member's information from HCM", async () => {
    const { findByRole, getByRole, getByText } = render(
      <NsoMpdQuestionnaireTestWrapper>
        <StaffInformation />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    expect(
      await findByRole('heading', { name: 'John Doe' }),
    ).toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Staff Status' })).toHaveValue(
      'Active - Payroll Eligible',
    );
    expect(getByRole('textbox', { name: 'Family Status' })).toHaveValue(
      'Married',
    );
    expect(getByRole('textbox', { name: 'Age' })).toHaveValue('34');
    expect(getByRole('textbox', { name: 'Tenure' })).toHaveValue('4');
    expect(getByRole('textbox', { name: 'Address' })).toHaveValue(
      '123 Main St, Apt 4, Miami, FL 33101',
    );
    expect(getByText('Staff Account Number: 000123456')).toBeInTheDocument();
  });

  it("toggles to the spouse's information", async () => {
    const { findByRole, getByRole } = render(
      <NsoMpdQuestionnaireTestWrapper>
        <StaffInformation />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    userEvent.click(await findByRole('button', { name: 'View Jane' }));

    expect(getByRole('heading', { name: 'Jane Doe' })).toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Age' })).toHaveValue('32');
    expect(getByRole('textbox', { name: 'Staff Status' })).toHaveValue(
      'Active - Paid Leave',
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
});
