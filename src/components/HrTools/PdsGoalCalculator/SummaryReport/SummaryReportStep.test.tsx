import React from 'react';
import { render } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { SummaryReportStep } from './SummaryReportStep';

describe('SummaryReportStep', () => {
  it('renders the header cards and data table', async () => {
    const { findByRole, getByRole } = render(
      <PdsGoalCalculatorTestWrapper>
        <SummaryReportStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('heading', { name: 'Your Goal' }),
    ).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Progress' })).toBeInTheDocument();
    expect(getByRole('grid', { name: 'PDS Goal Summary' })).toBeInTheDocument();
  });

  it('caps the progress percentage at 100% when supportRaised exceeds overallTotal', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper supportRaisedMock={999999}>
        <SummaryReportStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByRole('heading', { name: '100%' })).toBeInTheDocument();
  });
});
