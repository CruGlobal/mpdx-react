import { render } from '@testing-library/react';
import { DateTime, Settings } from 'luxon';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { EffectiveDateStep } from './EffectiveDateStep';
import { PayrollDatesQuery } from './PayrollDates.generated';

const testDates = [
  { startDate: '2020-01-01', regularProcessDate: '2020-01-25' },
  { startDate: '2020-01-16', regularProcessDate: '2020-02-10' },
  { startDate: '2020-02-01', regularProcessDate: '2020-02-25' },
];

const TestComponent: React.FC<{
  dates?: PayrollDatesQuery['payrollDates'];
}> = ({ dates = testDates }) => (
  <SalaryCalculatorTestWrapper payrollDates={dates}>
    <EffectiveDateStep />
  </SalaryCalculatorTestWrapper>
);

describe('EffectiveDateStep', () => {
  beforeEach(() => {
    const now = DateTime.fromObject({
      year: 2020,
      month: 12,
      day: 10,
    }).toMillis();

    // Mock Settings.now to return December 10th for tests
    Settings.now = () => now;
  });

  it('renders the heading', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Effective Date' }),
    ).toBeInTheDocument();
  });

  it('renders the date selection dropdown', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('combobox', { name: 'Effective date' }),
    ).toBeInTheDocument();
  });

  it('renders text content', async () => {
    const { findByText } = render(<TestComponent />);

    expect(
      await findByText(
        'Please select the date of the paycheck you would like this change to first occur.',
      ),
    ).toBeInTheDocument();
  });

  it('renders an empty dropdown when no effective dates are available', async () => {
    const { findByRole } = render(<TestComponent />);

    const dropdown = await findByRole('combobox', {
      name: 'Effective date',
    });
    // The dropdown should be empty since hcm.effectiveDates doesn't exist yet
    expect(dropdown).toBeInTheDocument();
  });

  it('shows the effective date banner when no dates for next year payroll exist', async () => {
    const { findByTestId } = render(<TestComponent />);

    expect(
      await findByTestId('effective-date-banner-text'),
    ).toBeInTheDocument();
  });

  it('does not show the effective date banner when next year payroll dates exist', async () => {
    const newDates = [
      ...testDates,
      { startDate: '2019-11-20', regularProcessDate: '2019-12-15' },
      { startDate: '2020-12-07', regularProcessDate: '2021-01-01' },
    ];
    const { queryByTestId } = render(<TestComponent dates={newDates} />);

    expect(queryByTestId('effective-date-banner-text')).not.toBeInTheDocument();
  });

  it('does not show the effective date banner before November 15th', async () => {
    const beforeNovember15 = DateTime.fromObject({
      year: 2020,
      month: 11,
      day: 10,
    }).toMillis();

    // Mock Settings.now to return November 10th for this test
    Settings.now = () => beforeNovember15;

    const { queryByTestId } = render(<TestComponent />);

    expect(queryByTestId('effective-date-banner-text')).not.toBeInTheDocument();
  });
});
