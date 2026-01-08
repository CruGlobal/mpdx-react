import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
import { SalaryCalculationQuery } from '../SalaryCalculatorContext/SalaryCalculation.generated';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../SalaryCalculatorTestWrapper';
import { MhaCard } from './MhaCard';

const defaultSalaryMock: DeepPartial<SalaryCalculationQuery['salaryRequest']> =
  {
    calculations: {
      minimumRequiredSalary: 10001,
      requestedAboveMinimum: 10002,
      requestedMha: 10003,
      requestedAboveMha: 10004,
      taxableCompensation: 10005,
      contributing403bAmount: 10006,
      contributingTaxDeferredAmount: 10007,
      contributingRothAmount: 10008,
      annualCompensation: 10009,
    },
    spouseCalculations: {
      minimumRequiredSalary: 20001,
      requestedAboveMinimum: 20002,
      requestedMha: 20003,
      requestedAboveMha: 20004,
      taxableCompensation: 20005,
      contributing403bAmount: 20006,
      contributingTaxDeferredAmount: 20007,
      contributingRothAmount: 20008,
      annualCompensation: 20009,
    },
  };

const TestComponent: React.FC<SalaryCalculatorTestWrapperProps> = (props) => (
  <SalaryCalculatorTestWrapper salaryRequestMock={defaultSalaryMock} {...props}>
    <MhaCard />
  </SalaryCalculatorTestWrapper>
);

describe('MhaCard', () => {
  it('should render table headers', async () => {
    const { getAllByRole } = render(<TestComponent />);

    await waitFor(() =>
      expect(
        getAllByRole('columnheader').map((cell) => cell.textContent),
      ).toEqual(['Category', 'John', 'Jane']),
    );
  });

  it('should render table cells with formatted currency values', async () => {
    const { getAllByRole } = render(<TestComponent />);

    const expectedCells = [
      ['15. Minimum Required Salary', '$10,001.00', '$20,001.00'],
      ['16. SubtotalLine 12 - Line 15', '$10,002.00', '$20,002.00'],
      [
        "17. Minister's Housing AllowanceUse the lesser of line 16 or your CCC Board approved amount.",
        '$10,003.00',
        '$20,003.00',
      ],
      [
        '18. SubtotalLine 16 - Line 17Enter the greater of this amount or zero.',
        '$10,004.00',
        '$20,004.00',
      ],
      ['19. Minimum Required Salary', '$10,001.00', '$20,001.00'],
      ['20. CompensationLine 18 + Line 19', '$10,005.00', '$20,005.00'],
      ['21. 403(b) AmountLine 14 - Line 12', '$10,006.00', '$20,006.00'],
      [
        'a. Tax-deferred (before tax) AmountNot taxed now',
        '$10,007.00',
        '$20,007.00',
      ],
      ['b. Roth (after-tax) AmountTaxed now', '$10,008.00', '$20,008.00'],
      ['c. Total AmountLine 21a + Line 21b', '$10,006.00', '$20,006.00'],
      [
        '22. Annual Compensation RateLine 20 + Line 21c',
        '$10,009.00',
        '$20,009.00',
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

    // 11 rows with 2 cells each
    expect(getAllByRole('cell').length).toBe(22);
  });
});
