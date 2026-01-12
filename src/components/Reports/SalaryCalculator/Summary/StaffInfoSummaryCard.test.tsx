import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { SalaryRequestStatusEnum } from 'src/graphql/types.generated';
import { HcmQuery } from '../SalaryCalculatorContext/Hcm.generated';
import { SalaryCalculationQuery } from '../SalaryCalculatorContext/SalaryCalculation.generated';
import { SalaryCalculatorProvider } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { hcmSpouseMock, hcmUserMock } from '../SalaryCalculatorTestWrapper';
import { StaffInfoSummaryCard } from './StaffInfoSummaryCard';

interface TestComponentProps {
  hasSpouse?: boolean;
  submitted?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  hasSpouse = true,
  submitted,
}) => (
  <GqlMockedProvider<{
    Hcm: HcmQuery;
    SalaryCalculation: SalaryCalculationQuery;
    GetUser: GetUserQuery;
  }>
    mocks={{
      Hcm: {
        hcm: hasSpouse ? [hcmUserMock, hcmSpouseMock] : [hcmUserMock],
      },
      SalaryCalculation: {
        salaryRequest: {
          status: submitted
            ? SalaryRequestStatusEnum.Pending
            : SalaryRequestStatusEnum.InProgress,
          effectiveDate: '2024-01-15',
          submittedAt: '2025-01-01',
        },
      },
      GetUser: {
        user: {
          staffAccountId: '123456',
        },
      },
    }}
  >
    <SalaryCalculatorProvider>
      <StaffInfoSummaryCard />
    </SalaryCalculatorProvider>
  </GqlMockedProvider>
);

describe('StaffInfoSummaryCard', () => {
  it('should render table cells', async () => {
    const { getAllByRole } = render(<TestComponent />);

    const expectedCells = [
      ['Staff Account Number', '123456'],
      ['Full Names', 'John Doe and Jane Doe'],
      ['Phone Number', '555-0123'],
      ['Email Address', 'john.doe@example.comjane.doe@example.com'],
      ['Effective for Paycheck Dated', '1/15/2024'],
    ].flat();

    await waitFor(() =>
      expect(getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
        expectedCells,
      ),
    );
  });

  it('should render submitted date', async () => {
    const { findByRole } = render(<TestComponent submitted />);

    expect(await findByRole('cell', { name: '1/1/2025' })).toBeInTheDocument();
  });

  describe('single', () => {
    it('should render table cells', async () => {
      const { getAllByRole } = render(<TestComponent hasSpouse={false} />);

      const expectedCells = [
        ['Staff Account Number', '123456'],
        ['Full Names', 'John Doe'],
        ['Phone Number', '555-0123'],
        ['Email Address', 'john.doe@example.com'],
        ['Effective for Paycheck Dated', '1/15/2024'],
      ].flat();

      await waitFor(() =>
        expect(getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
          expectedCells,
        ),
      );
    });
  });
});
