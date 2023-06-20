import React from 'react';
import { render } from '@testing-library/react';
import { WeeklyReportProgress } from './WeeklyReportModalProgress';

describe('Weekly Report Modal Progress Bar', () => {
  it('checks for the progress bar', () => {
    const { getByTestId } = render(
      <WeeklyReportProgress totalSteps={8} activeStep={1} />,
    );
    expect(getByTestId('WeeklyReportModalStepCounterBox').className).toContain(
      'MuiBox-root',
    );
    expect(
      getByTestId('WeeklyReportModalStepCounterCount').textContent,
    ).toEqual('1/8');
  });
});
