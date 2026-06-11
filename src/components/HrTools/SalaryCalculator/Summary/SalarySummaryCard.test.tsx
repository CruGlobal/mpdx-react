import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { HcmQuery } from '../../Shared/HcmData/Hcm.generated';
import {
  EffectiveSalaryCalculationQuery,
  SalaryCalculationQuery,
} from '../SalaryCalculatorContext/SalaryCalculation.generated';
import { SalaryCalculatorProvider } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { hcmSpouseMock, hcmUserMock } from '../SalaryCalculatorTestWrapper';
import { SalarySummaryCard } from './SalarySummaryCard';

const approvedSalaryMock: DeepPartial<
  EffectiveSalaryCalculationQuery['salaryRequest']
> = {
  personNumber: hcmUserMock.staffInfo.personNumber,
  salary: 10001,
  mhaAmount: 10002,
  spouseSalary: 20001,
  spouseMhaAmount: 20002,
  calculations: {
    contributing403bFraction: 0.1,
    effectiveCap: 10003,
  },
  spouseCalculations: {
    contributing403bFraction: 0.2,
    effectiveCap: 20003,
  },
};

const defaultSalaryMock: DeepPartial<SalaryCalculationQuery['salaryRequest']> =
  {
    id: 'salary-request-1',
    salary: 30001,
    mhaAmount: 30002,
    spouseSalary: 40001,
    spouseMhaAmount: 40002,
    calculations: {
      contributing403bFraction: 0.3,
      effectiveCap: 30003,
    },
    spouseCalculations: {
      contributing403bFraction: 0.4,
      effectiveCap: 40003,
    },
  };

interface TestComponentProps {
  hasSpouse?: boolean;
  hasApprovedCalculation?: boolean;
  hasSpouseApprovedCalculation?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  hasSpouse = true,
  hasApprovedCalculation = true,
  hasSpouseApprovedCalculation = false,
}) => (
  <TestRouter
    router={{
      query: { calculationId: 'salary-request-1' },
    }}
  >
    <GqlMockedProvider<{
      Hcm: HcmQuery;
      SalaryCalculation: SalaryCalculationQuery;
      EffectiveSalaryCalculation: EffectiveSalaryCalculationQuery;
    }>
      mocks={{
        Hcm: {
          hcm: hasSpouse ? [hcmUserMock, hcmSpouseMock] : [hcmUserMock],
        },
        SalaryCalculation: {
          salaryRequest: defaultSalaryMock,
        },
        EffectiveSalaryCalculation: {
          salaryRequest: hasApprovedCalculation
            ? {
                ...approvedSalaryMock,
                personNumber: hasSpouseApprovedCalculation
                  ? hcmSpouseMock.staffInfo.personNumber
                  : hcmUserMock.staffInfo.personNumber,
              }
            : null,
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
  it('should render table headers and cells', async () => {
    const { getAllByRole } = render(<TestComponent />);

    await waitFor(() => {
      const tables = getAllByRole('table');
      expect(tables).toHaveLength(2);

      const [userTable, spouseTable] = tables;
      expect(userTable).toHaveTableStructure({
        columnHeaders: ['John', 'Old', 'New'],
        cells: [
          ['Requested Salary', '$10,001.00', '$30,001.00'],
          ['MHA', '$10,002.00', '$30,002.00'],
          ['403(b) Contribution', '10.00%', '30.00%'],
          ['Max Allowable Salary', '$10,003.00', '$30,003.00'],
        ],
      });
      expect(spouseTable).toHaveTableStructure({
        columnHeaders: ['Jane', 'Old', 'New'],
        cells: [
          ['Requested Salary', '$20,001.00', '$40,001.00'],
          ['MHA', '$20,002.00', '$40,002.00'],
          ['403(b) Contribution', '20.00%', '40.00%'],
          ['Max Allowable Salary', '$20,003.00', '$40,003.00'],
        ],
      });
    });
  });

  it('swaps fields when the spouse created the request', async () => {
    const { getAllByRole } = render(
      <TestComponent hasSpouseApprovedCalculation />,
    );

    await waitFor(() => {
      const tables = getAllByRole('table');
      expect(tables).toHaveLength(2);

      const [userTable, spouseTable] = tables;
      expect(userTable).toHaveTableStructure({
        cells: [
          ['Requested Salary', '$20,001.00', '$30,001.00'],
          ['MHA', '$20,002.00', '$30,002.00'],
          ['403(b) Contribution', '20.00%', '30.00%'],
          ['Max Allowable Salary', '$20,003.00', '$30,003.00'],
        ],
      });
      expect(spouseTable).toHaveTableStructure({
        cells: [
          ['Requested Salary', '$10,001.00', '$40,001.00'],
          ['MHA', '$10,002.00', '$40,002.00'],
          ['403(b) Contribution', '10.00%', '40.00%'],
          ['Max Allowable Salary', '$10,003.00', '$40,003.00'],
        ],
      });
    });
  });

  describe('no approved calculation', () => {
    it('should hide the Old column headers and cells', async () => {
      const { getAllByRole } = render(
        <TestComponent hasApprovedCalculation={false} />,
      );

      await waitFor(() => {
        const tables = getAllByRole('table');
        expect(tables).toHaveLength(2);

        const [userTable, spouseTable] = tables;
        expect(userTable).toHaveTableStructure({
          columnHeaders: ['John', 'New'],
          cells: [
            ['Requested Salary', '$30,001.00'],
            ['MHA', '$30,002.00'],
            ['403(b) Contribution', '30.00%'],
            ['Max Allowable Salary', '$30,003.00'],
          ],
        });
        expect(spouseTable).toHaveTableStructure({
          columnHeaders: ['Jane', 'New'],
          cells: [
            ['Requested Salary', '$40,001.00'],
            ['MHA', '$40,002.00'],
            ['403(b) Contribution', '40.00%'],
            ['Max Allowable Salary', '$40,003.00'],
          ],
        });
      });
    });
  });

  describe('single', () => {
    it('should render table headers and cells', async () => {
      const { getByRole } = render(<TestComponent hasSpouse={false} />);

      await waitFor(() =>
        expect(getByRole('table')).toHaveTableStructure({
          columnHeaders: ['John', 'Old', 'New'],
          cells: [
            ['Requested Salary', '$10,001.00', '$30,001.00'],
            ['MHA', '$10,002.00', '$30,002.00'],
            ['403(b) Contribution', '10.00%', '30.00%'],
            ['Max Allowable Salary', '$10,003.00', '$30,003.00'],
          ],
        }),
      );
    });
  });
});
