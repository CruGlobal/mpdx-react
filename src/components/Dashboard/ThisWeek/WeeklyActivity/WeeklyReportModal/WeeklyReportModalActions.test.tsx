import React from 'react';
import { render } from '@testing-library/react';
import { WeeklyReportActions } from './WeeklyReportModalActions';

describe('Weekly Report Modal Navigation', () => {
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
