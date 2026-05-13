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

const overCap: DeepPartial<SalaryCalculationQuery['salaryRequest']> = {
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
      salaryRequestMock: overCap,
    });

    await waitFor(() => expect(result.current.blockOnCap).toBe(true));
  });

  it('does not block when reason is null', async () => {
    const { result } = renderUseSosaBlockOverCap({
      hasSpouse: false,
      hcmUser: sosaUser,
      salaryRequestMock: { progressiveApprovalTierReason: null },
    });

    await waitFor(() => expect(result.current.isUserSosa).toBe(true));
    expect(result.current.blockOnCap).toBe(false);
  });

  it('does not block when the user is not SOSA, even if over cap', async () => {
    const { result } = renderUseSosaBlockOverCap({
      hasSpouse: false,
      salaryRequestMock: overCap,
    });

    await waitFor(() => expect(result.current.isUserSosa).toBe(false));
    expect(result.current.blockOnCap).toBe(false);
  });
});
