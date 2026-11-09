import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
import {
  ProgressiveApprovalTierReasonEnum,
  UserPersonTypeEnum,
} from 'src/graphql/types.generated';
import { SalaryCalculationQuery } from '../SalaryCalculatorContext/SalaryCalculation.generated';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { useSosaBlockOverCap } from './useSosaBlockOverCap';

const sosaUser = {
  staffInfo: { userPersonType: UserPersonTypeEnum.EmployeeStaffNonRmoSpouse },
};

const withGross = (
  requestedYtdGross: number,
): DeepPartial<SalaryCalculationQuery['salaryRequest']> => ({
  calculations: { effectiveCap: 75000, hardCap: 90000, requestedYtdGross },
  progressiveApprovalTierReason: ProgressiveApprovalTierReasonEnum.OverUserCap,
});

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
  it('blocks when a SOSA user is over their hard cap', async () => {
    const { result } = renderUseSosaBlockOverCap({
      hasSpouse: false,
      hcmUser: sosaUser,
      salaryRequestMock: withGross(90001),
    });

    await waitFor(() => expect(result.current.blockOnCap).toBe(true));
  });

  it('does not block when a SOSA user is over their effective cap but within their hard cap', async () => {
    const { result } = renderUseSosaBlockOverCap({
      hasSpouse: false,
      hcmUser: sosaUser,
      salaryRequestMock: withGross(82000),
    });

    await waitFor(() => expect(result.current.isUserSosa).toBe(true));
    expect(result.current.blockOnCap).toBe(false);
  });

  it('does not block when a SOSA user is exactly at their hard cap', async () => {
    const { result } = renderUseSosaBlockOverCap({
      hasSpouse: false,
      hcmUser: sosaUser,
      salaryRequestMock: withGross(90000),
    });

    await waitFor(() => expect(result.current.isUserSosa).toBe(true));
    expect(result.current.blockOnCap).toBe(false);
  });

  it('does not block when the user is not SOSA, even if over their hard cap', async () => {
    const { result } = renderUseSosaBlockOverCap({
      hasSpouse: false,
      salaryRequestMock: withGross(90001),
    });

    await waitFor(() => expect(result.current.isUserSosa).toBe(false));
    expect(result.current.blockOnCap).toBe(false);
  });
});
