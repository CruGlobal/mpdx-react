import React from 'react';
import { render } from '@testing-library/react';
import { WeeklyReportAlerts } from './WeeklyReportModalAlerts';

describe('Weekly Report Modal Alerts', () => {
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
