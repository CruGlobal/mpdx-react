import { render, waitFor } from '@testing-library/react';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../SalaryCalculatorTestWrapper';
import { FourOhThreeBSection } from './403bSection';

const TestComponent: React.FC<SalaryCalculatorTestWrapperProps> = (props) => (
  <SalaryCalculatorTestWrapper
    hcmUser={{
      fourOThreeB: { maximumContributionLimit: 10001 },
    }}
    hcmSpouse={{
      fourOThreeB: { maximumContributionLimit: 20001 },
    }}
    {...props}
  >
    <FourOhThreeBSection />
  </SalaryCalculatorTestWrapper>
);

describe('403bSection', () => {
  describe('married', () => {
    it('should render table headers and formatted cell values', async () => {
      const { getByRole } = render(<TestComponent />);

      await waitFor(() =>
        expect(getByRole('table')).toHaveTableStructure({
          columnHeaders: ['Category', 'John', 'Jane'],
          rowHeaders: [
            'Current Tax-Deferred Contribution Percent',
            'Current Roth 403(b) Contribution Percent',
            'Maximum Contribution Limit',
          ],
          cells: [
            ['5.00%', '8.00%'],
            ['12.00%', '10.00%'],
            ['$10,001.00', '$20,001.00'],
          ],
        }),
      );
    });

    it('should render the effective paycheck note when payroll dates match', async () => {
      const { findByRole } = render(
        <TestComponent
          salaryRequestMock={{ effectiveDate: '2026-06-01' }}
          payrollDates={[
            { startDate: '2026-06-01', regularProcessDate: '2026-06-10' },
          ]}
        />,
      );

      expect(await findByRole('note')).toHaveTextContent(
        'Values shown reflect the paycheck dated 6/10/2026.',
      );
    });
  });

  describe('single', () => {
    it('should render table headers and formatted cell values', async () => {
      const { getByRole } = render(<TestComponent hasSpouse={false} />);

      await waitFor(() =>
        expect(getByRole('table')).toHaveTableStructure({
          columnHeaders: ['Category', 'John'],
          rowHeaders: [
            'Current Tax-Deferred Contribution Percent',
            'Current Roth 403(b) Contribution Percent',
            'Maximum Contribution Limit',
          ],
          cells: ['5.00%', '12.00%', '$10,001.00'],
        }),
      );
    });
  });
});
