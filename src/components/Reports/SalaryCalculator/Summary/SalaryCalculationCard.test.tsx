import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
import { SalaryCalculationQuery } from '../SalaryCalculatorContext/SalaryCalculation.generated';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../SalaryCalculatorTestWrapper';
import { SalaryCalculationCard } from './SalaryCalculationCard';

const defaultSalaryMock: DeepPartial<SalaryCalculationQuery['salaryRequest']> =
  {
    calculations: {
      annualBase: 10001,
      requestedSeca: 10002,
      secaEstimatedFraction: 0.22,
      requestedWithSeca: 10003,
      minimumRequiredSalary: 10004,
      contributing403bFraction: 0.1,
      non403bFraction: 0.9,
      requestedGross: 10005,
    },
    spouseCalculations: {
      annualBase: 20001,
      requestedSeca: 20002,
      secaEstimatedFraction: 0.22,
      requestedWithSeca: 20003,
      minimumRequiredSalary: 20004,
      contributing403bFraction: 0.2,
      non403bFraction: 0.8,
      requestedGross: 20005,
    },
  };

const TestComponent: React.FC<SalaryCalculatorTestWrapperProps> = (props) => (
  <SalaryCalculatorTestWrapper salaryRequestMock={defaultSalaryMock} {...props}>
    <SalaryCalculationCard />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryCalculationCard', () => {
  it('should render table headers', async () => {
    const { getAllByRole } = render(<TestComponent />);

    await waitFor(() =>
      expect(
        getAllByRole('columnheader').map((cell) => cell.textContent),
      ).toEqual(['Category', 'John', 'Jane']),
    );
  });

  it('should render table cells with formatted currency and percentage values', async () => {
    const { getAllByRole } = render(<TestComponent />);

    const expectedCells = [
      [
        '10. Requested SalaryBefore SECA and 403(b)',
        '$10,001.00',
        '$20,001.00',
      ],
      ['11. Taxes', '$10,002.00', '$20,002.00'],
      ['a. SECA(If applicable) Line 10 × 0.22', '$10,002.00', '$20,002.00'],
      [
        'b. State and Local(If selected in Step 6) Line 10 × 0.05',
        'TBD',
        'TBD',
      ],
      [
        '12. SubtotalLine 10 + Line 11This amount must be at least $10,004.00',
        '$10,003.00',
        '$20,003.00',
      ],
      ['13. 403(b) Contribution'],
      ['a. Tax-deferred (before tax) percentage', '5.00%', '8.00%'],
      ['b. Roth (after-tax) percentage', '12.00%', '10.00%'],
      ['c. Total ContributionLine 13a + 13b', '10.00%', '20.00%'],
      ['d. 1.00 minus 403(b) percentage', '90.00%', '80.00%'],
      [
        '14. Gross SalaryLine 12 ÷ Line 13dIf this amount is greater than your CAP (the lesser of line 9a or 9b), it must be approved.',
        '$10,005.00',
        '$20,005.00',
      ],
    ].flat();

    await waitFor(() =>
      expect(getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
        expectedCells,
      ),
    );
  });

  it('should render fewer table headers and cells when single', async () => {
    const { getAllByRole } = render(<TestComponent hasSpouse={false} />);

    await waitFor(() =>
      expect(
        getAllByRole('columnheader').map((cell) => cell.textContent),
      ).toEqual(['Category', 'John']),
    );

    // 10 rows with 2 cells each and 1 row (row 13) with one cell
    expect(getAllByRole('cell').length).toBe(21);
  });
});
