import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
import { SalaryCalculationQuery } from '../../SalaryCalculatorContext/SalaryCalculation.generated';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../../SalaryCalculatorTestWrapper';
import { RequestedSalaryCard } from './RequestedSalaryCard';

const defaultSalaryMock: DeepPartial<SalaryCalculationQuery['salaryRequest']> =
  {
    calculations: {
      minimumRequiredSalary: 10002,
      minimumRequestedSalary: 10003,
      effectiveCap: 10004,
    },
    spouseCalculations: {
      minimumRequiredSalary: 20002,
      minimumRequestedSalary: 20003,
      effectiveCap: 20004,
    },
  };

const TestComponent: React.FC<SalaryCalculatorTestWrapperProps> = (props) => (
  <SalaryCalculatorTestWrapper
    salaryRequestMock={defaultSalaryMock}
    hcmUser={{
      currentSalary: { grossSalaryAmount: 10001 },
    }}
    hcmSpouse={{
      currentSalary: { grossSalaryAmount: 20001 },
    }}
    {...props}
  >
    <RequestedSalaryCard />
  </SalaryCalculatorTestWrapper>
);

describe('RequestedSalaryCard', () => {
  describe('married', () => {
    it('should render explanation message', async () => {
      const { getByTestId } = render(<TestComponent />);

      await waitFor(() =>
        expect(getByTestId('RequestedSalaryCard-message')).toHaveTextContent(
          "Below, enter the annual salary amount you would like to request. \
This salary level includes taxes (local, state, and federal) and Minister's Housing Allowance. \
It does not include either Social Security (SECA) or 403b. They will be added in later. \
Because of IRS and Cru requirements, the lowest salary you can request is $10,003.00 (MHA + $10,002.00 - SECA) for John \
and $20,003.00 (MHA + $20,002.00 - SECA) for Jane. \
As you set your salary level, the amount you receive should reflect the amount of time you work in ministry.",
        ),
      );
    });

    it('should render table headers', async () => {
      const { getAllByRole } = render(<TestComponent />);

      await waitFor(() =>
        expect(
          getAllByRole('columnheader').map((cell) => cell.textContent),
        ).toEqual(['Category', 'John', 'Jane']),
      );

      await waitFor(() =>
        expect(
          getAllByRole('rowheader').map((cell) => cell.textContent),
        ).toEqual([
          'Current Salary',
          'Minimum Salary',
          'Maximum Allowable Salary (CAP)',
          'Requested Salary',
        ]),
      );
    });

    it('should render table cells with formatted currency', async () => {
      const { getAllByRole } = render(<TestComponent />);

      const expectedCells = [
        ['$10,001', '$20,001'],
        ['$10,003', '$20,003'],
        ['$10,004', '$20,004'],
      ].flat();

      await waitFor(() =>
        expect(
          getAllByRole('cell')
            // Skip the two inputs
            .slice(0, -2)
            .map((cell) => cell.textContent),
        ).toEqual(expectedCells),
      );
    });
  });

  describe('single', () => {
    it('should render explanation message', async () => {
      const { getByTestId } = render(<TestComponent hasSpouse={false} />);

      await waitFor(() =>
        expect(getByTestId('RequestedSalaryCard-message')).toHaveTextContent(
          "Below, enter the annual salary amount you would like to request. \
This salary level includes taxes (local, state, and federal) and Minister's Housing Allowance. \
It does not include either Social Security (SECA) or 403b. They will be added in later. \
Because of IRS and Cru requirements, the lowest salary you can request is $10,003.00 (MHA + $10,002.00 - SECA). \
As you set your salary level, the amount you receive should reflect the amount of time you work in ministry.",
        ),
      );
    });

    it('should render table headers', async () => {
      const { getAllByRole } = render(<TestComponent hasSpouse={false} />);

      await waitFor(() =>
        expect(
          getAllByRole('columnheader').map((cell) => cell.textContent),
        ).toEqual(['Category', 'John']),
      );

      await waitFor(() =>
        expect(
          getAllByRole('rowheader').map((cell) => cell.textContent),
        ).toEqual([
          'Current Salary',
          'Minimum Salary',
          'Maximum Allowable Salary (CAP)',
          'Requested Salary',
        ]),
      );
    });

    it('should render table cells with formatted currency', async () => {
      const { getAllByRole } = render(<TestComponent hasSpouse={false} />);

      const expectedCells = [['$10,001'], ['$10,003'], ['$10,004']].flat();

      await waitFor(() =>
        expect(
          getAllByRole('cell')
            // Skip the one input
            .slice(0, -1)
            .map((cell) => cell.textContent),
        ).toEqual(expectedCells),
      );
    });
  });
});
