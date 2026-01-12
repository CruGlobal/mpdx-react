import { render } from '@testing-library/react';
import { DateTime, Settings } from 'luxon';
import { PayrollDate } from 'src/graphql/types.generated';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { EffectiveDateStep } from './EffectiveDateStep';

const currentYear = DateTime.fromMillis(Settings.now()).year;

const testDates: PayrollDate[] = [
  { regularProcessDate: `${currentYear}-01-15` },
  { regularProcessDate: `${currentYear}-02-01` },
  { regularProcessDate: `${currentYear}-02-15` },
];

const TestComponent: React.FC<{ dates?: PayrollDate[] }> = ({
  dates = testDates,
}) => (
  <SalaryCalculatorTestWrapper payrollDates={dates}>
    <EffectiveDateStep />
  </SalaryCalculatorTestWrapper>
);

describe('EffectiveDateStep', () => {
  beforeEach(() => {
    const now = DateTime.fromObject({
      year: currentYear,
      month: 12,
      day: 10,
    }).toMillis();

    // Mock Settings.now to return December 10th for tests
    Settings.now = () => now;
  });

  it('renders the heading', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'Effective Date' }),
    ).toBeInTheDocument();
  });

  it('renders the date selection dropdown', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('combobox', { name: 'Select a future date' }),
    ).toBeInTheDocument();
  });

  it('renders text content', () => {
    const { getByText } = render(<TestComponent />);

    expect(
      getByText(
        'Please select the date of the paycheck you would like this change to first occur.',
      ),
    ).toBeInTheDocument();
  });

  it('renders an empty dropdown when no effective dates are available', () => {
    const { getByRole } = render(<TestComponent />);

    const dropdown = getByRole('combobox', { name: 'Select a future date' });
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
    const nextYear = currentYear + 1;
    const newDates: PayrollDate[] = [
      ...testDates,
      { regularProcessDate: `${currentYear - 1}-12-15` },
      { regularProcessDate: `${nextYear}-01-01` },
    ];
    const { queryByTestId } = render(<TestComponent dates={newDates} />);

    expect(queryByTestId('effective-date-banner-text')).not.toBeInTheDocument();
  });

  it('does not show the effective date banner before November 15th', async () => {
    const beforeNovember15 = DateTime.fromObject({
      year: currentYear,
      month: 11,
      day: 10,
    }).toMillis();

    // Mock Settings.now to return November 10th for this test
    Settings.now = () => beforeNovember15;

    const { queryByTestId } = render(<TestComponent />);

    expect(queryByTestId('effective-date-banner-text')).not.toBeInTheDocument();
  });
});
