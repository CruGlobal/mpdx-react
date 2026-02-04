import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { HcmQuery } from '../SalaryCalculatorContext/Hcm.generated';
import { SalaryCalculationQuery } from '../SalaryCalculatorContext/SalaryCalculation.generated';
import { SalaryCalculatorProvider } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { hcmSpouseMock, hcmUserMock } from '../SalaryCalculatorTestWrapper';
import { SalarySummaryCard } from './SalarySummaryCard';

const approvedSalaryMock: DeepPartial<SalaryCalculationQuery['salaryRequest']> =
  {
    salary: 10001,
    mhaAmount: 10002,
    salaryCap: 10003,
    spouseSalary: 20001,
    spouseMhaAmount: 20002,
    spouseSalaryCap: 20003,
    calculations: {
      contributing403bFraction: 0.1,
    },
    spouseCalculations: {
      contributing403bFraction: 0.2,
    },
  };

const defaultSalaryMock: DeepPartial<SalaryCalculationQuery['salaryRequest']> =
  {
    id: 'salary-request-1',
    salary: 30001,
    mhaAmount: 30002,
    salaryCap: 30003,
    spouseSalary: 40001,
    spouseMhaAmount: 40002,
    spouseSalaryCap: 40003,
    calculations: {
      contributing403bFraction: 0.3,
    },
    spouseCalculations: {
      contributing403bFraction: 0.4,
    },
  };

interface TestComponentProps {
  hasSpouse?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ hasSpouse = true }) => (
  <TestRouter
    router={{
      query: { calculationId: 'salary-request-1' },
    }}
  >
    <GqlMockedProvider<{
      Hcm: HcmQuery;
      SalaryCalculation: SalaryCalculationQuery;
    }>
      mocks={{
        Hcm: {
          hcm: hasSpouse ? [hcmUserMock, hcmSpouseMock] : [hcmUserMock],
        },
        SalaryCalculation: {
          salaryRequest: defaultSalaryMock,
        },
        ApprovedSalaryCalculation: {
          salaryRequest: approvedSalaryMock,
        },
      }}
    >
      <SalaryCalculatorProvider>
        <SalarySummaryCard />
      </SalaryCalculatorProvider>
    </GqlMockedProvider>
  </TestRouter>
);

describe('SalarySummaryCard', () => {
  it('should render table headers', async () => {
    const { getAllByRole } = render(<TestComponent />);

    const expectedHeaders = [
      ['John', 'Old', 'New'],
      ['Jane', 'Old', 'New'],
    ].flat();

    await waitFor(() =>
      expect(
        getAllByRole('columnheader').map((cell) => cell.textContent),
      ).toEqual(expectedHeaders),
    );
  });

  it('should render table cells', async () => {
    const { getAllByRole } = render(<TestComponent />);

    const expectedCells = [
      ['Requested Salary', '$10,001.00', '$30,001.00'],
      ['MHA', '$10,002.00', '$30,002.00'],
      ['403(b) Contribution', '10.00%', '30.00%'],
      ['Max Allowable Salary', '$10,003.00', '$30,003.00'],
      ['Requested Salary', '$20,001.00', '$40,001.00'],
      ['MHA', '$20,002.00', '$40,002.00'],
      ['403(b) Contribution', '20.00%', '40.00%'],
      ['Max Allowable Salary', '$20,003.00', '$40,003.00'],
    ].flat();

    await waitFor(() =>
      expect(getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
        expectedCells,
      ),
    );
  });

  describe('single', () => {
    it('should render table headers', async () => {
      const { getAllByRole } = render(<TestComponent hasSpouse={false} />);

      await waitFor(() =>
        expect(
          getAllByRole('columnheader').map((cell) => cell.textContent),
        ).toEqual(['John', 'Old', 'New']),
      );
    });

    it('should render table cells', async () => {
      const { getAllByRole } = render(<TestComponent hasSpouse={false} />);

      const expectedCells = [
        ['Requested Salary', '$10,001.00', '$30,001.00'],
        ['MHA', '$10,002.00', '$30,002.00'],
        ['403(b) Contribution', '10.00%', '30.00%'],
        ['Max Allowable Salary', '$10,003.00', '$30,003.00'],
      ].flat();

      await waitFor(() =>
        expect(getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
          expectedCells,
        ),
      );
    });
  });
});
