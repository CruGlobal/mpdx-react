import { renderHook, waitFor } from '@testing-library/react';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../SalaryCalculatorTestWrapper';
import { useSpouseCapFirst } from './useSpouseCapFirst';

type SalaryRequestMock = SalaryCalculatorTestWrapperProps['salaryRequestMock'];

const renderUseSpouseCapFirst = (
  salaryRequestMock: SalaryRequestMock,
  hasSpouse = true,
) =>
  renderHook(() => useSpouseCapFirst(), {
    wrapper: ({ children }) => (
      <SalaryCalculatorTestWrapper
        salaryRequestMock={salaryRequestMock}
        hasSpouse={hasSpouse}
      >
        {children}
      </SalaryCalculatorTestWrapper>
    ),
  });

// John is over his cap while Jane still has room, and the couple is under the combined cap
const userOverMock = {
  splitCapRequired: false,
  manuallySplitCap: false,
  calculations: {
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
      spouseCalculations: { requestedYtdGross: 55000, effectiveCap: 50000 },
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
    const { result } = renderUseSpouseCapFirst(userOverMock, false);

    await waitFor(() => expect(result.current.blocked).toBe(false));
  });
});
