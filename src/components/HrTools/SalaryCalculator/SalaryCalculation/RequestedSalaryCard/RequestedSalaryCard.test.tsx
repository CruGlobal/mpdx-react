import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
import { AutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
import {
  ProgressiveApprovalTierReasonEnum,
  UserPersonTypeEnum,
} from 'src/graphql/types.generated';
import { SalaryCalculationQuery } from '../../SalaryCalculatorContext/SalaryCalculation.generated';
import {
  EffectiveSalaryRequestMock,
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
  hcmSpouseMock,
  hcmUserMock,
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

const approvedSalaryMock: EffectiveSalaryRequestMock = {
  personNumber: hcmUserMock.staffInfo.personNumber,
  salary: 11111,
  spouseSalary: 22222,
};

const TestComponent: React.FC<SalaryCalculatorTestWrapperProps> = ({
  effectiveSalaryRequestMock = approvedSalaryMock,
  ...props
}) => (
  <SalaryCalculatorTestWrapper
    salaryRequestMock={defaultSalaryMock}
    effectiveSalaryRequestMock={effectiveSalaryRequestMock}
    hcmUser={{
      currentSalary: { grossSalaryAmount: 10001 },
    }}
    hcmSpouse={{
      currentSalary: { grossSalaryAmount: 20001 },
    }}
    {...props}
  >
    <AutosaveForm>
      <RequestedSalaryCard />
    </AutosaveForm>
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
          'Current Requested Salary',
          'Minimum Salary',
          'Maximum Allowable Salary (CAP)',
          'Requested Salary',
        ]),
      );
    });

    it('should render table cells with formatted currency', async () => {
      const { getAllByRole } = render(<TestComponent />);

      const expectedCells = [
        ['$11,111.00', '$22,222.00'],
        ['$10,003.00', '$20,003.00'],
        ['$10,004.00', '$20,004.00'],
      ].flat();

      await waitFor(() =>
        expect(
          getAllByRole('cell')
            .slice(0, -2)
            .map((cell) => cell.textContent),
        ).toEqual(expectedCells),
      );
    });

    it('should render a dash when there is no approved salary request', async () => {
      const { getAllByRole } = render(
        <TestComponent effectiveSalaryRequestMock={null} />,
      );

      const expectedCells = [
        ['–', '–'],
        ['$10,003.00', '$20,003.00'],
        ['$10,004.00', '$20,004.00'],
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

    it('swaps the requested salary when the spouse created the request', async () => {
      const { getAllByRole } = render(
        <TestComponent
          effectiveSalaryRequestMock={{
            ...approvedSalaryMock,
            personNumber: hcmSpouseMock.staffInfo.personNumber,
          }}
        />,
      );

      await waitFor(() =>
        expect(
          getAllByRole('cell')
            .slice(0, -2)
            .map((cell) => cell.textContent),
        ).toEqual(
          [
            ['$22,222.00', '$11,111.00'],
            ['$10,003.00', '$20,003.00'],
            ['$10,004.00', '$20,004.00'],
          ].flat(),
        ),
      );
    });

    it('should render the effective paycheck note when payroll dates match', async () => {
      const { findByRole } = render(
        <TestComponent
          salaryRequestMock={{
            ...defaultSalaryMock,
            effectiveDate: '2026-06-01',
          }}
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
          'Current Requested Salary',
          'Minimum Salary',
          'Maximum Allowable Salary (CAP)',
          'Requested Salary',
        ]),
      );
    });

    it('should render table cells with formatted currency', async () => {
      const { getAllByRole } = render(<TestComponent hasSpouse={false} />);

      const expectedCells = ['$11,111.00', '$10,003.00', '$10,004.00'];

      await waitFor(() =>
        expect(
          getAllByRole('cell')
            .slice(0, -1)
            .map((cell) => cell.textContent),
        ).toEqual(expectedCells),
      );
    });

    it('should render a dash when there is no approved salary request', async () => {
      const { getAllByRole } = render(
        <TestComponent hasSpouse={false} effectiveSalaryRequestMock={null} />,
      );

      const expectedCells = ['–', '$10,003.00', '$10,004.00'];

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

  describe('SOSA over-cap Alert', () => {
    const sosaUser = {
      staffInfo: {
        userPersonType: UserPersonTypeEnum.EmployeeStaffNonRmoSpouse,
      },
    };
    const overCapMock: DeepPartial<SalaryCalculationQuery['salaryRequest']> = {
      calculations: {
        minimumRequiredSalary: 10002,
        minimumRequestedSalary: 10003,
        effectiveCap: 10004,
        requestedGross: 15000,
      },
      progressiveApprovalTierReason:
        ProgressiveApprovalTierReasonEnum.OverUserCap,
    };

    it('renders when the SOSA user is over their effective cap', async () => {
      const { findByRole } = render(
        <TestComponent
          hasSpouse={false}
          hcmUser={{ ...sosaUser, currentSalary: { grossSalaryAmount: 10001 } }}
          salaryRequestMock={overCapMock}
        />,
      );

      expect(await findByRole('alert')).toHaveTextContent(
        'Your request requires additional approvals and cannot be submitted online. SOSA staff can have requests exceeding the $10,004.00 cap approved for certain geographic locations with the appropriate levels of approval.Please contact payroll@cru.org for further assistance.',
      );
      expect(
        await findByRole('link', { name: 'payroll@cru.org' }),
      ).toHaveAttribute('href', 'mailto:payroll@cru.org');
    });

    it('does not render when the user is SOSA but under their cap', async () => {
      const { queryByRole } = render(
        <TestComponent
          hasSpouse={false}
          hcmUser={{ ...sosaUser, currentSalary: { grossSalaryAmount: 10001 } }}
        />,
      );

      await waitFor(() => expect(queryByRole('alert')).not.toBeInTheDocument());
    });

    it('does not render when the user is not SOSA, even if over cap', async () => {
      const { queryByRole } = render(
        <TestComponent hasSpouse={false} salaryRequestMock={overCapMock} />,
      );

      await waitFor(() => expect(queryByRole('alert')).not.toBeInTheDocument());
    });
  });
});
