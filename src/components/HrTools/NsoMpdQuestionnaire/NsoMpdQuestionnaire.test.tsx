import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NsoMpdQuestionnaire } from './NsoMpdQuestionnaire';
import {
  NsoMpdQuestionnaireTestWrapper,
  NsoMpdQuestionnaireTestWrapperProps,
} from './NsoMpdQuestionnaireTestWrapper';

const TestComponent: React.FC<
  Omit<NsoMpdQuestionnaireTestWrapperProps, 'children'>
> = (props) => (
  <NsoMpdQuestionnaireTestWrapper {...props}>
    <NsoMpdQuestionnaire />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('NsoMpdQuestionnaire', () => {
  it('renders the first view step by default', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Staff Information' }),
    ).toBeInTheDocument();
  });

  it('renders the matching step page after continuing to the next step', async () => {
    const { findByRole } = render(<TestComponent />);

    // Personal Information is a review-only step, so Continue enables once it registers.
    const continueButton = await findByRole('button', { name: 'Continue' });
    await waitFor(() => expect(continueButton).toBeEnabled());
    userEvent.click(continueButton);

    expect(
      await findByRole('heading', { name: 'Ministry Information' }),
    ).toBeInTheDocument();
  });

  it('enables Continue on the review-only first step and gates it on the next', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent
        newStaffQuestionnaire={{
          ministryName: null,
          ministryLocation: null,
          geographicLocation: null,
          assignmentType: null,
        }}
      />,
    );

    // Personal Information has nothing to fill in, so Continue enables.
    const continueButton = await findByRole('button', { name: 'Continue' });
    await waitFor(() => expect(continueButton).toBeEnabled());
    userEvent.click(continueButton);

    expect(
      await findByRole('heading', { name: 'Ministry Information' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(getByRole('button', { name: 'Continue' })).toBeDisabled(),
    );
  });

  it('shows the informational view when there is no open questionnaire', async () => {
    const { findByText, queryByRole } = render(
      <TestComponent newStaffQuestionnaire={null} />,
    );

    expect(await findByText('No open questionnaire')).toBeInTheDocument();
    expect(
      queryByRole('heading', { name: 'Staff Information' }),
    ).not.toBeInTheDocument();
  });
});
