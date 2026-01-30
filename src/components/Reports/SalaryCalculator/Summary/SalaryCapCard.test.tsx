import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
import { SalaryCalculationQuery } from '../SalaryCalculatorContext/SalaryCalculation.generated';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../SalaryCalculatorTestWrapper';
import { SalaryCapCard } from './SalaryCapCard';

const defaultSalaryMock: DeepPartial<SalaryCalculationQuery['salaryRequest']> =
  {
    location: 'New York',
    calculations: {
      annualBase: 10001,
      additionalSalary: 10002,
      geographicAdjustment: 10003,
      tenureAdjustment: 10004,
      oldSalaryCap: 10005,
      secaEstimatedFraction: 0.22,
      oldSecaAmount: 10006,
      capWithSeca: 10007,
      contributing403bFraction: 0.1,
      non403bFraction: 0.9,
      calculatedCap: 10008,
      effectiveCap: 10009,
      hardCap: 10010,
      combinedCap: 10011,
    },
    spouseCalculations: {
      annualBase: 20001,
      additionalSalary: 20002,
      geographicAdjustment: 20003,
      tenureAdjustment: 20004,
      oldSalaryCap: 20005,
      secaEstimatedFraction: 0.22,
      oldSecaAmount: 20006,
      capWithSeca: 20007,
      contributing403bFraction: 0.2,
      non403bFraction: 0.8,
      calculatedCap: 20008,
      effectiveCap: 20009,
    },
  };

const TestComponent: React.FC<SalaryCalculatorTestWrapperProps> = (props) => (
  <SalaryCalculatorTestWrapper salaryRequestMock={defaultSalaryMock} {...props}>
    <SalaryCapCard />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryCapCard', () => {
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
      ['1. Annual Base', '$10,001.00', '$20,001.00'],
      ['2. Additional Salary', '$10,002.00', '$20,002.00'],
      [
        '3. Geographic AdjustmentCity: New YorkLine 2 × Geographic Cost of Living Factor',
        '$10,003.00',
        '$20,003.00',
      ],
      ['4. Tenure', '$10,004.00', '$20,004.00'],
      ['5. SubtotalLine 3 + Line 4', '$10,005.00', '$20,005.00'],
      [
        '6. SECA(If applicable) Line 5 × 0.22Includes tax on the social security',
        '$10,006.00',
        '$20,006.00',
      ],
      ['7. SubtotalLine 5 + Line 6', '$10,007.00', '$20,007.00'],
      ['8. 403(b) Contribution', '-', '-'],
      ['a. 403(b) Contribution Percentage', '10.00%', '20.00%'],
      ['b. 1.00 Minus 403(b) Percentage', '0.90', '0.80'],
      [
        '9. Maximum Allowable Salary (CAP)Line 7 × Line 8bFor a couple, the combined CAPs cannot exceed $10,011.00, with neither individual exceeding $10,010.00.',
      ],
      ['a. CAP', '$10,008.00', '$20,008.00'],
      ['b. Minimum', '$10,009.00', '$20,009.00'],
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

    // 12 rows with 2 cells each and 1 row (row 9) with one cell
    expect(getAllByRole('cell').length).toBe(25);
  });
});
