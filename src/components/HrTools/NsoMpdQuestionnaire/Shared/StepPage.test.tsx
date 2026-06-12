import React from 'react';
import { render } from '@testing-library/react';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { StepPage } from './StepPage';
import { SubStep } from './SubStepList';

const subSteps: SubStep[] = [
  { id: 'one', title: 'Section One' },
  { id: 'two', title: 'Section Two' },
];

const renderStepPage = (steps: SubStep[] = subSteps) =>
  render(
    <NsoMpdQuestionnaireTestWrapper>
      <StepPage subSteps={steps}>
        <div>Main body</div>
      </StepPage>
    </NsoMpdQuestionnaireTestWrapper>,
  );

describe('StepPage', () => {
  it('renders the main content', () => {
    const { getByText } = renderStepPage();

    expect(getByText('Main body')).toBeInTheDocument();
  });

  it('renders the sub-step list', () => {
    const { getByText } = renderStepPage();

    expect(getByText('2. Section Two')).toBeInTheDocument();
  });

  it('shows the first sub-step as current by default', () => {
    const { getByText } = renderStepPage();

    expect(getByText('1. Section One').closest('li')).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  it('renders without sub-steps when the list is empty', () => {
    const { getByText, queryByText } = renderStepPage([]);

    expect(getByText('Main body')).toBeInTheDocument();
    expect(queryByText(/Section/)).not.toBeInTheDocument();
  });
});
