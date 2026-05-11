import { render, waitFor, within } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { SummaryReportSectionList } from './SummaryReportSectionList';

describe('SummaryReportSectionList', () => {
  it('renders the MPD Goal section as complete when summary data has a positive overall total', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper>
        <SummaryReportSectionList />
      </PdsGoalCalculatorTestWrapper>,
    );

    const mpdGoalItem = await findByRole('listitem');
    expect(mpdGoalItem).toHaveTextContent('MPD Goal');
    await waitFor(() =>
      expect(within(mpdGoalItem).getByTestId('CircleIcon')).toBeInTheDocument(),
    );
  });
});
