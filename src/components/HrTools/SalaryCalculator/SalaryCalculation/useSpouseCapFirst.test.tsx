import { renderHook, waitFor } from '@testing-library/react';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../SalaryCalculatorTestWrapper';
import { useSpouseCapFirst } from './useSpouseCapFirst';

type SalaryRequestMock = SalaryCalculatorTestWrapperProps['salaryRequestMock'];

interface RenderOptions {
  hasSpouse?: boolean;
  editing?: boolean;
  /** What HCM pays John today */
  userCurrentGross?: number;
  /** What HCM pays Jane today */
  spouseCurrentGross?: number;
}

const renderUseSpouseCapFirst = (
  salaryRequestMock: SalaryRequestMock,
  {
    hasSpouse = true,
    editing = true,
    userCurrentGross = 70000,
    spouseCurrentGross = 40000,
  }: RenderOptions = {},
) =>
  renderHook(() => useSpouseCapFirst(), {
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
  });

// John asks for a raise that takes him over his cap while Jane still has room, and the couple is
// under the combined cap
const userOverMock = {
  splitCapRequired: false,
  manuallySplitCap: false,
  calculations: {
    requestedGross: 80000,
    requestedYtdGross: 80000,
    effectiveCap: 75000,
    combinedCap: 135000,
  },
  spouseCalculations: { requestedYtdGross: 40000, effectiveCap: 50000 },
};

describe('useSpouseCapFirst', () => {
  it('blocks while the other spouse is under their cap', async () => {
    const { result } = renderUseSpouseCapFirst(userOverMock);

    await waitFor(() =>
      expect(result.current).toEqual({
        blocked: true,
        overName: 'John',
        otherName: 'Jane',
        otherCap: '$50,000.00',
        manuallySplitCap: false,
      }),
    );
  });

  it('names the spouse when the spouse is the one over their cap', async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      calculations: { ...userOverMock.calculations, requestedYtdGross: 60000 },
      spouseCalculations: {
        requestedGross: 55000,
        requestedYtdGross: 55000,
        effectiveCap: 50000,
      },
    });

    await waitFor(() =>
      expect(result.current).toMatchObject({
        blocked: true,
        overName: 'Jane',
        otherName: 'John',
        otherCap: '$75,000.00',
      }),
    );
  });

  it('blocks when the couple lands exactly on the combined cap', async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      calculations: { ...userOverMock.calculations, combinedCap: 120000 },
    });

    await waitFor(() => expect(result.current.blocked).toBe(true));
  });

  it('reports a couple that splits the combined cap by hand', async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      splitCapRequired: true,
      manuallySplitCap: true,
    });

    await waitFor(() => expect(result.current.manuallySplitCap).toBe(true));
  });

  // MPDX-10360: a couple over the combined cap goes to the normal approval levels
  it('does not block when the couple is over the combined cap', async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      calculations: { ...userOverMock.calculations, combinedCap: 119999.99 },
    });

    await waitFor(() => expect(result.current.blocked).toBe(false));
  });

  it('does not block when the other spouse is within $5 of their cap', async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      spouseCalculations: { requestedYtdGross: 49995, effectiveCap: 50000 },
    });

    await waitFor(() => expect(result.current.blocked).toBe(false));
  });

  it('blocks when the other spouse is just past $5 under their cap', async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      spouseCalculations: { requestedYtdGross: 49994.99, effectiveCap: 50000 },
    });

    await waitFor(() => expect(result.current.blocked).toBe(true));
  });

  it('does not block when both spouses are over their caps', async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      spouseCalculations: { requestedYtdGross: 50000.01, effectiveCap: 50000 },
    });

    await waitFor(() => expect(result.current.blocked).toBe(false));
  });

  it('does not block a requester exactly at their cap', async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      calculations: { ...userOverMock.calculations, requestedYtdGross: 75000 },
    });

    await waitFor(() => expect(result.current.blocked).toBe(false));
  });

  it('compares amounts in cents', async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      calculations: {
        ...userOverMock.calculations,
        requestedYtdGross: 75000.004,
      },
    });

    await waitFor(() => expect(result.current.blocked).toBe(false));
  });

  it('does not block without a spouse', async () => {
    const { result } = renderUseSpouseCapFirst(userOverMock, {
      hasSpouse: false,
    });

    await waitFor(() => expect(result.current.blocked).toBe(false));
  });

  it('does not block a request that is only being viewed', async () => {
    const { result } = renderUseSpouseCapFirst(userOverMock, {
      editing: false,
    });

    await waitFor(() => expect(result.current.blocked).toBe(false));
  });

  it('does not block without an effective date, like the server', async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      effectiveDate: null,
    });

    await waitFor(() => expect(result.current.blocked).toBe(false));
  });

  it('does not block a manual split missing a chosen cap, like the server', async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      splitCapRequired: true,
      manuallySplitCap: true,
      salaryCap: 75000,
      spouseSalaryCap: null,
    });

    await waitFor(() => expect(result.current.blocked).toBe(false));
  });

  it('asks an automatic split to reach the rest of the combined cap', async () => {
    // Half the unused combined cap makes Jane's effective cap $57,500, but that moves as she
    // raises her salary. The couple is settled once she reaches $135,000 - $80,000.
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      splitCapRequired: true,
      spouseCalculations: {
        requestedYtdGross: 40000,
        effectiveCap: 57500,
        personalFactorsCap: 70000,
        hardCap: 80000,
      },
    });

    await waitFor(() =>
      expect(result.current).toMatchObject({
        blocked: true,
        otherCap: '$55,000.00',
      }),
    );
  });

  it("limits an automatic split's amount to the other spouse's own cap", async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      splitCapRequired: true,
      spouseCalculations: {
        requestedYtdGross: 40000,
        effectiveCap: 50000,
        personalFactorsCap: 50000,
        hardCap: 80000,
      },
    });

    await waitFor(() =>
      expect(result.current).toMatchObject({
        blocked: true,
        otherCap: '$50,000.00',
      }),
    );
  });

  // MPDX-10360: only a raise that takes a spouse over their cap must wait for the other spouse
  describe('when the spouse over their cap is not asking for a raise', () => {
    it('does not block an unchanged salary', async () => {
      const { result } = renderUseSpouseCapFirst(userOverMock, {
        userCurrentGross: 80000,
      });

      await waitFor(() => expect(result.current.blocked).toBe(false));
    });

    it('does not block a pay cut', async () => {
      const { result } = renderUseSpouseCapFirst(userOverMock, {
        userCurrentGross: 85000,
      });

      await waitFor(() => expect(result.current.blocked).toBe(false));
    });

    it('does not block a change of $5 or less, which can be rounding', async () => {
      const { result } = renderUseSpouseCapFirst(userOverMock, {
        userCurrentGross: 79995,
      });

      await waitFor(() => expect(result.current.blocked).toBe(false));
    });

    it('does not block an unchanged salary that is over cap from earlier ASRs', async () => {
      const { result } = renderUseSpouseCapFirst(
        {
          ...userOverMock,
          calculations: {
            ...userOverMock.calculations,
            requestedGross: 70000,
            requestedYtdGross: 80000,
          },
        },
        { userCurrentGross: 70000 },
      );

      await waitFor(() => expect(result.current.blocked).toBe(false));
    });
  });

  it('blocks a raise of more than $5', async () => {
    const { result } = renderUseSpouseCapFirst(userOverMock, {
      userCurrentGross: 79994.99,
    });

    await waitFor(() => expect(result.current.blocked).toBe(true));
  });
});
