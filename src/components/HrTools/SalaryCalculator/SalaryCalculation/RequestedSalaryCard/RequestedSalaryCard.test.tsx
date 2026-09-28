import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeepPartial } from 'ts-essentials';
import { AutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
import {
  ProgressiveApprovalTierReasonEnum,
  UserPersonTypeEnum,
} from 'src/graphql/types.generated';
import {
  CalculationFieldsFragment,
  SalaryCalculationQuery,
} from '../../SalaryCalculatorContext/SalaryCalculation.generated';
import {
  EffectiveSalaryRequestMock,
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
  hcmSpouseMock,
  hcmUserMock,
} from '../../SalaryCalculatorTestWrapper';
import {
  RequestedSalaryCard,
  estimateRequestedSalary,
} from './RequestedSalaryCard';

const defaultSalaryMock: DeepPartial<SalaryCalculationQuery['salaryRequest']> =
  {
    calculations: {
      minimumRequiredSalary: 10002,
      minimumRequestedSalary: 10003,
      effectiveCap: 10004,
      non403bFraction: 0.851,
      secaEstimatedFraction: 0,
    },
    spouseCalculations: {
      minimumRequiredSalary: 20002,
      minimumRequestedSalary: 20003,
      effectiveCap: 20004,
      non403bFraction: 0.9,
      secaEstimatedFraction: 0.1,
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

    it('should render table headers and cells with formatted currency', async () => {
      const { getByRole } = render(<TestComponent />);

      await waitFor(() =>
        expect(getByRole('table')).toHaveTableStructure({
          columnHeaders: ['Category', 'John', 'Jane'],
          rowHeaders: [
            'Current Requested Salary',
            'Minimum Salary',
            'Maximum Allowable Salary (CAP)',
            'Requested Salary',
          ],
          cells: [
            ['$11,111.00', '$22,222.00'],
            ['$10,003.00', '$20,003.00'],
            ['$10,004.00', '$20,004.00'],
            // The requested salary inputs
            [
              expect.stringContaining('Requested salary'),
              expect.stringContaining('Spouse requested salary'),
            ],
          ],
        }),
      );
    });

    it('should not render the estimate tooltip when there is an approved salary request', async () => {
      const { getByRole, queryByTestId } = render(<TestComponent />);

      await waitFor(() =>
        expect(getByRole('table')).toHaveTableStructure({
          cells: [
            ['$11,111.00', '$22,222.00'],
            ['$10,003.00', '$20,003.00'],
            ['$10,004.00', '$20,004.00'],
            [
              expect.stringContaining('Requested salary'),
              expect.stringContaining('Spouse requested salary'),
            ],
          ],
        }),
      );
      expect(
        queryByTestId('RequestedSalaryCard-estimateIcon'),
      ).not.toBeInTheDocument();
    });

    it('should render an estimate from HCM when there is no approved salary request', async () => {
      const { getByRole, getAllByTestId, findByRole } = render(
        <TestComponent effectiveSalaryRequestMock={null} />,
      );

      await waitFor(() =>
        expect(getByRole('table')).toHaveTableStructure({
          cells: [
            // 10001 * 0.851 / 1 = 8510.85 and 20001 * 0.9 / 1.1 = 16364.45
            ['$8,511.00', '$16,364.00'],
            ['$10,003.00', '$20,003.00'],
            ['$10,004.00', '$20,004.00'],
            // The requested salary inputs
            [
              expect.stringContaining('Requested salary'),
              expect.stringContaining('Spouse requested salary'),
            ],
          ],
        }),
      );
      expect(getAllByTestId('RequestedSalaryCard-estimateIcon')).toHaveLength(
        2,
      );

      userEvent.hover(getAllByTestId('RequestedSalaryCard-estimateIcon')[0]);
      expect(await findByRole('tooltip')).toHaveTextContent(
        'We could not find an approved salary request on file, so this is our best estimate based on your current salary and 403(b) contributions in HCM. Please check your current salary in HCM to confirm it.',
      );
    });

    it('should render a dash when there is no approved salary request or HCM salary', async () => {
      const { getByRole, queryByTestId } = render(
        <TestComponent
          effectiveSalaryRequestMock={null}
          hcmUser={{ currentSalary: { grossSalaryAmount: null } }}
          hcmSpouse={{ currentSalary: { grossSalaryAmount: null } }}
        />,
      );

      await waitFor(() =>
        expect(getByRole('table')).toHaveTableStructure({
          cells: [
            ['–', '–'],
            ['$10,003.00', '$20,003.00'],
            ['$10,004.00', '$20,004.00'],
            [
              expect.stringContaining('Requested salary'),
              expect.stringContaining('Spouse requested salary'),
            ],
          ],
        }),
      );
      expect(
        queryByTestId('RequestedSalaryCard-estimateIcon'),
      ).not.toBeInTheDocument();
    });

    it('swaps the requested salary when the spouse created the request', async () => {
      const { getByRole } = render(
        <TestComponent
          effectiveSalaryRequestMock={{
            ...approvedSalaryMock,
            personNumber: hcmSpouseMock.staffInfo.personNumber,
          }}
        />,
      );

      await waitFor(() =>
        expect(getByRole('table')).toHaveTableStructure({
          cells: [
            ['$22,222.00', '$11,111.00'],
            ['$10,003.00', '$20,003.00'],
            ['$10,004.00', '$20,004.00'],
            // The requested salary inputs
            [
              expect.stringContaining('Requested salary'),
              expect.stringContaining('Spouse requested salary'),
            ],
          ],
        }),
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

    it('should render table headers and cells with formatted currency', async () => {
      const { getByRole } = render(<TestComponent hasSpouse={false} />);

      await waitFor(() =>
        expect(getByRole('table')).toHaveTableStructure({
          columnHeaders: ['Category', 'John'],
          rowHeaders: [
            'Current Requested Salary',
            'Minimum Salary',
            'Maximum Allowable Salary (CAP)',
            'Requested Salary',
          ],
          cells: [
            '$11,111.00',
            '$10,003.00',
            '$10,004.00',
            // The requested salary input
            expect.stringContaining('Requested salary'),
          ],
        }),
      );
    });

    it('should render an estimate from HCM when there is no approved salary request', async () => {
      const { getByRole, getAllByTestId } = render(
        <TestComponent hasSpouse={false} effectiveSalaryRequestMock={null} />,
      );

      await waitFor(() =>
        expect(getByRole('table')).toHaveTableStructure({
          cells: [
            '$8,511.00',
            '$10,003.00',
            '$10,004.00',
            // The requested salary input
            expect.stringContaining('Requested salary'),
          ],
        }),
      );
      expect(getAllByTestId('RequestedSalaryCard-estimateIcon')).toHaveLength(
        1,
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

describe('estimateRequestedSalary', () => {
  it('reverses the gross salary calculation', () => {
    // Real HCM data: $45,997.65 gross with 14.9% Roth 403(b) and SECA opt out
    expect(
      estimateRequestedSalary(45997.65, {
        non403bFraction: 0.851,
        secaEstimatedFraction: 0,
      } as CalculationFieldsFragment),
    ).toBe(39144);
  });

  it('accounts for SECA', () => {
    expect(
      estimateRequestedSalary(11000, {
        non403bFraction: 1,
        secaEstimatedFraction: 0.1,
      } as CalculationFieldsFragment),
    ).toBe(10000);
  });

  it('returns null without a gross salary or calculations', () => {
    expect(
      estimateRequestedSalary(null, {
        non403bFraction: 1,
        secaEstimatedFraction: 0,
      } as CalculationFieldsFragment),
    ).toBeNull();
    expect(estimateRequestedSalary(10000, null)).toBeNull();
  });
});
