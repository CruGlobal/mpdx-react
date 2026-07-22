import { render } from '@testing-library/react';
import { MPGAIncomeExpensesReportTestWrapper } from '../MPGAIncomeExpensesReportTestWrapper';
import { CardSkeleton } from './CardSkeleton';

const title = 'Test Title';

describe('CardSkeleton', () => {
  it('should render card title and subtitle', () => {
    const { getByText } = render(
      <MPGAIncomeExpensesReportTestWrapper>
        <CardSkeleton title={title} />
      </MPGAIncomeExpensesReportTestWrapper>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText('Last 12 Months')).toBeInTheDocument();
  });
});
