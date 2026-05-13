import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
import { UserPersonTypeEnum } from 'pages/api/graphql-rest.page.generated';
import { ProgressiveApprovalTierReasonEnum } from 'src/graphql/types.generated';
import { SalaryCalculationQuery } from '../SalaryCalculatorContext/SalaryCalculation.generated';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { useSosaBlockOverCap } from './useSosaBlockOverCap';

const sosaUser = {
  staffInfo: { userPersonType: UserPersonTypeEnum.EmployeeStaffNonRmoSpouse },
};

const overCapMock: DeepPartial<SalaryCalculationQuery['salaryRequest']> = {
  calculations: { effectiveCap: 10004, requestedGross: 15000 },
  progressiveApprovalTierReason: ProgressiveApprovalTierReasonEnum.OverUserCap,
};

const renderUseSosaBlockOverCap = (
  props: Parameters<typeof SalaryCalculatorTestWrapper>[0],
) =>
  renderHook(() => useSosaBlockOverCap(), {
    wrapper: ({ children }) => (
      <SalaryCalculatorTestWrapper {...props}>
        {children}
      </SalaryCalculatorTestWrapper>
    ),
  });

describe('useSosaBlockOverCap', () => {
  it('blocks when a SOSA user is over their cap', async () => {
    const { result } = renderUseSosaBlockOverCap({
      hasSpouse: false,
      hcmUser: sosaUser,
      salaryRequestMock: overCapMock,
    });

    await waitFor(() => expect(result.current.blockOnCap).toBe(true));
  });

  it('does not block when a SOSA user is under their cap', async () => {
    const { result } = renderUseSosaBlockOverCap({
      hasSpouse: false,
      hcmUser: sosaUser,
      salaryRequestMock: {
        calculations: { effectiveCap: 10004, requestedGross: 10003 },
      },
    });

    await waitFor(() => expect(result.current.isUserSosa).toBe(true));
    expect(result.current.blockOnCap).toBe(false);
  });

  it('does not block when a SOSA user is exactly at their cap', async () => {
    const { result } = renderUseSosaBlockOverCap({
      hasSpouse: false,
      hcmUser: sosaUser,
      salaryRequestMock: {
        calculations: { effectiveCap: 10004, requestedGross: 10004 },
      },
    });

    await waitFor(() => expect(result.current.isUserSosa).toBe(true));
    expect(result.current.blockOnCap).toBe(false);
  });

  it('does not block when the user is not SOSA, even if over cap', async () => {
    const { result } = renderUseSosaBlockOverCap({
      hasSpouse: false,
      salaryRequestMock: overCapMock,
    });

    await waitFor(() => expect(result.current.isUserSosa).toBe(false));
    expect(result.current.blockOnCap).toBe(false);
  });
});
