import React from 'react';
import { render } from '@testing-library/react';
import { WeeklyReportAlerts, WeeklyReportProgress } from './WeeklyReportModal';

describe('Weekly Report Modal', () => {
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
  it('checks for form submission success alert', async () => {
    const { getByTestId } = render(
      <WeeklyReportAlerts
        questionsLength={8}
        activeStep={9}
        onClose={() => {}}
      />,
    );
    expect(
      getByTestId('WeeklyReportModalAlerts').children[0].className,
    ).toContain('MuiAlert-standardSuccess');
  });
  it('checks for form no questions alert', async () => {
    const { getByTestId } = render(
      <WeeklyReportAlerts
        questionsLength={0}
        activeStep={1}
        onClose={() => {}}
      />,
    );
    expect(
      getByTestId('WeeklyReportModalAlerts').children[0].className,
    ).toContain('MuiAlert-standardWarning');
  });
});
