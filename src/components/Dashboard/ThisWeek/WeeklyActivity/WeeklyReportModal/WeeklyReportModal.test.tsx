import React from 'react';
import { render } from '@testing-library/react';
import {
  WeeklyReportActions,
  WeeklyReportAlerts,
  WeeklyReportProgress,
} from './WeeklyReportModal';

describe('Weekly Report Modal', () => {
  describe('Progress Bar', () => {
    it('checks for the progress bar', () => {
      const { getByTestId } = render(
        <WeeklyReportProgress totalSteps={8} activeStep={1} />,
      );
      expect(
        getByTestId('WeeklyReportModalStepCounterBox').className,
      ).toContain('MuiBox-root');
      expect(
        getByTestId('WeeklyReportModalStepCounterCount').textContent,
      ).toEqual('1/8');
    });
  });

  describe('Navigation', () => {
    it('checks for form navigation buttons on first step', async () => {
      const { queryByText } = render(
        <WeeklyReportActions
          questionsLength={8}
          activeStep={1}
          prevQuestion={() => {}}
          save={() => {}}
          value={'abc'}
          isValid={true}
        />,
      );
      expect(queryByText('Back')).not.toBeInTheDocument();
      expect(queryByText('Next')).toBeInTheDocument();
    });
    it('checks for form navigation buttons on steps 2-7', async () => {
      const { queryByText } = render(
        <WeeklyReportActions
          questionsLength={8}
          activeStep={2}
          prevQuestion={() => {}}
          save={() => {}}
          value={'abc'}
          isValid={true}
        />,
      );
      expect(queryByText('Back')).toBeInTheDocument();
      expect(queryByText('Next')).toBeInTheDocument();
    });
    it('checks for form navigation buttons on step 8', async () => {
      const { queryByText } = render(
        <WeeklyReportActions
          questionsLength={8}
          activeStep={8}
          prevQuestion={() => {}}
          save={() => {}}
          value={'abc'}
          isValid={true}
        />,
      );
      expect(queryByText('Back')).toBeInTheDocument();
      expect(queryByText('Submit')).toBeInTheDocument();
    });
  });

  describe('Alerts', () => {
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
});
