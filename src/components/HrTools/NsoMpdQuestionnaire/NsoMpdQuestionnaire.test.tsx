import React from 'react';
import { render } from '@testing-library/react';
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
      await findByRole('heading', { name: 'Questionnaire Step 1' }),
    ).toBeInTheDocument();
  });

  it('renders the matching step page when a view step is selected', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    userEvent.click(
      await findByRole('button', { name: 'Questionnaire Step 2' }),
    );

    expect(
      getByRole('heading', { name: 'Questionnaire Step 2' }),
    ).toBeInTheDocument();
  });

  it('keeps Continue disabled until the step is valid', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(await findByRole('button', { name: 'Continue' })).toBeDisabled();

    userEvent.type(
      getByRole('textbox', { name: 'Cell Phone Number' }),
      '1234567',
    );

    expect(getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  it('shows the informational view when there is no open questionnaire', async () => {
    const { findByText, queryByRole } = render(
      <TestComponent newStaffQuestionnaire={null} />,
    );

    expect(await findByText('No open questionnaire')).toBeInTheDocument();
    expect(
      queryByRole('heading', { name: 'Questionnaire Step 1' }),
    ).not.toBeInTheDocument();
  });
});
