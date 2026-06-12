import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NsoMpdQuestionnaire } from './NsoMpdQuestionnaire';
import { NsoMpdQuestionnaireTestWrapper } from './NsoMpdQuestionnaireTestWrapper';

const TestComponent: React.FC = () => (
  <NsoMpdQuestionnaireTestWrapper>
    <NsoMpdQuestionnaire />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('NsoMpdQuestionnaire', () => {
  it('renders the first view step by default', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'Questionnaire Step 1' }),
    ).toBeInTheDocument();
  });

  it('renders the matching step page when a view step is selected', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Questionnaire Step 2' }));

    expect(
      getByRole('heading', { name: 'Questionnaire Step 2' }),
    ).toBeInTheDocument();
  });
});
