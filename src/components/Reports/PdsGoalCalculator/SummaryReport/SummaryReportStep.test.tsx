import React from 'react';
import { render } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { SummaryReportStep } from './SummaryReportStep';

describe('SummaryReportStep', () => {
  it('renders the summary report heading', () => {
    const { getByText } = render(
      <PdsGoalCalculatorTestWrapper>
        <SummaryReportStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(getByText('Summary Report')).toBeInTheDocument();
  });
});
