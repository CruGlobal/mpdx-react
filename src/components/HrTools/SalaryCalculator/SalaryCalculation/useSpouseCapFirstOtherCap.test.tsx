import { waitFor } from '@testing-library/react';
import {
  renderUseSpouseCapFirst,
  userOverMock,
} from './spouseCapFirstTestUtils';

// The amount the alert asks the other spouse to reach
describe('useSpouseCapFirst otherCap', () => {
  it('asks an automatic split to reach the rest of the combined cap', async () => {
    // Half the unused combined cap makes Jane's effective cap $57,500, but that moves as she
    // raises her salary. The couple is settled once she reaches $135,000 - $80,000.
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      splitCapRequired: true,
      spouseCalculations: {
        requestedGross: 40000,
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
        autoSplitCap: true,
      }),
    );
  });

  it('asks an automatic split to reach the rest of the combined cap, not the cap shown today', async () => {
    // Stage QA: Jane's cap shows $42,871.66 today, but each raise adds half to it. At $42,871.66
    // her cap would be $45,727.50, so she would still be blocked. They meet at $135,000 - $86,416.67.
    const { result } = renderUseSpouseCapFirst(
      {
        ...userOverMock,
        splitCapRequired: true,
        calculations: {
          requestedGross: 86416.67,
          requestedYtdGross: 86416.67,
          effectiveCap: 85000,
          combinedCap: 135000,
        },
        spouseCalculations: {
          requestedGross: 37159.98,
          requestedYtdGross: 37159.98,
          effectiveCap: 42871.66,
          personalFactorsCap: 70000,
          hardCap: 80000,
        },
      },
      { userCurrentGross: 78415.5, spouseCurrentGross: 37159.98 },
    );

    await waitFor(() =>
      expect(result.current).toMatchObject({
        blocked: true,
        otherCap: '$48,583.33',
        autoSplitCap: true,
      }),
    );
  });

  it("limits an automatic split's amount to the other spouse's own cap", async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      splitCapRequired: true,
      spouseCalculations: {
        requestedGross: 40000,
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

  it("leaves this year's ASRs out of the other spouse's target", async () => {
    // Jane's $10,000 of ASRs already count toward her $50,000 cap
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      spouseCalculations: {
        requestedGross: 30000,
        requestedYtdGross: 40000,
        effectiveCap: 50000,
      },
    });

    await waitFor(() =>
      expect(result.current).toMatchObject({
        blocked: true,
        otherCap: '$40,000.00',
      }),
    );
  });
});
