// Shared setup for the useSpouseCapFirst tests
import { RenderHookResult, renderHook, waitFor } from '@testing-library/react';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../SalaryCalculatorTestWrapper';
import { useSpouseCapFirst } from './useSpouseCapFirst';

export type SalaryRequestMock =
  SalaryCalculatorTestWrapperProps['salaryRequestMock'];

interface RenderOptions {
  hasSpouse?: boolean;
  editing?: boolean;
  /** What HCM pays John today */
  userCurrentGross?: number;
  /** What HCM pays Jane today */
  spouseCurrentGross?: number;
}

export const renderUseSpouseCapFirst = (
  salaryRequestMock: SalaryRequestMock,
  {
    hasSpouse = true,
    editing = true,
    userCurrentGross = 70000,
    spouseCurrentGross = 40000,
  }: RenderOptions = {},
) =>
  // HCM loads after the calculation, so once it is in, the rule has run on real data
  renderHook(
    () => ({ ...useSpouseCapFirst(), loaded: !!useSalaryCalculator().hcmUser }),
    {
      wrapper: ({ children }) => (
        <SalaryCalculatorTestWrapper
          salaryRequestMock={salaryRequestMock}
          hasSpouse={hasSpouse}
          editing={editing}
          hcmUser={{ currentSalary: { grossSalaryAmount: userCurrentGross } }}
          hcmSpouse={{
            currentSalary: { grossSalaryAmount: spouseCurrentGross },
          }}
        >
          {children}
        </SalaryCalculatorTestWrapper>
      ),
    },
  );

export type HookResult = RenderHookResult<
  ReturnType<typeof useSpouseCapFirst> & { loaded: boolean },
  unknown
>['result'];

// Not blocked is also the answer before the data loads, so wait for it before asserting that
export const waitForLoaded = (result: HookResult) =>
  waitFor(() => expect(result.current.loaded).toBe(true));

// John asks for a raise that takes him over his cap while Jane still has room, and the couple is
// under the combined cap
export const userOverMock = {
  splitCapRequired: false,
  manuallySplitCap: false,
  calculations: {
    requestedGross: 80000,
    requestedYtdGross: 80000,
    effectiveCap: 75000,
    combinedCap: 135000,
  },
  spouseCalculations: {
    requestedGross: 40000,
    requestedYtdGross: 40000,
    effectiveCap: 50000,
  },
};
