import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { MinistryInformation } from './MinistryInformation';

const TestComponent: React.FC = () => (
  <NsoMpdQuestionnaireTestWrapper>
    <MinistryInformation />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('MinistryInformation', () => {
  it('keeps Continue disabled until all four fields are answered', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    const continueButton = getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();

    const ministryCombobox = getByRole('combobox', {
      name: 'What ministry are you expecting to serve with?',
    });
    await waitFor(() =>
      expect(ministryCombobox).not.toHaveAttribute('aria-disabled', 'true'),
    );
    userEvent.click(ministryCombobox);
    userEvent.click(await findByRole('option', { name: 'University' }));

    userEvent.type(
      getByRole('textbox', {
        name: 'What is your expected ministry assignment location?',
      }),
      'Orlando, FL',
    );

    const cityCombobox = await findByRole('combobox', {
      name: 'Is your ministry assignment location within 50 miles of one of these cities?',
    });
    await waitFor(() =>
      expect(cityCombobox).not.toHaveAttribute('aria-disabled', 'true'),
    );
    userEvent.click(cityCombobox);
    userEvent.click(await findByRole('option', { name: 'Atlanta, GA' }));

    userEvent.click(getByRole('radio', { name: 'Field' }));

    expect(continueButton).toBeEnabled();
  });
});
