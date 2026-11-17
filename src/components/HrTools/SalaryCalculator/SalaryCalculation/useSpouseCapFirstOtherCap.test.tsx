import { waitFor } from '@testing-library/react';
import {
  SalaryRequestMock,
  renderUseSpouseCapFirst,
  userOverMock,
} from './spouseCapFirstTestUtils';

// John at $80,000 is over his cap, and Jane at $40,000 is under hers, with the combined cap split
// automatically. Each case sets Jane's own caps.
const autoSplitMock = (
  spouseCalculations: NonNullable<SalaryRequestMock>['spouseCalculations'],
): SalaryRequestMock => ({
  ...userOverMock,
  splitCapRequired: true,
  spouseCalculations: {
    requestedGross: 40000,
    requestedYtdGross: 40000,
    combinedCap: 135000,
    ...spouseCalculations,
  },
});

// The amount the alert asks the other spouse to reach
describe('useSpouseCapFirst otherCap', () => {
  it('asks an automatic split to reach the rest of the combined cap', async () => {
    // Half the unused combined cap makes Jane's effective cap $47,500, but that moves as she
    // raises her salary. The couple is settled once she reaches $135,000 - $80,000.
    const { result } = renderUseSpouseCapFirst(
      autoSplitMock({
        effectiveCap: 47500,
        personalFactorsCap: 70000,
        hardCap: 80000,
      }),
    );

    await waitFor(() =>
      expect(result.current).toMatchObject({
        blocked: true,
        otherCap: '$55,000.00',
        otherCapRises: true,
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
          combinedCap: 135000,
        },
      },
      { userCurrentGross: 78415.5, spouseCurrentGross: 37159.98 },
    );

    await waitFor(() =>
      expect(result.current).toMatchObject({
        blocked: true,
        otherCap: '$48,583.33',
        otherCapRises: true,
      }),
    );
  });

  it("splits by the other spouse's own combined cap, like the server", async () => {
    // Jane's combined cap is $125,000, so her split is (125,000 + 40,000 - 80,000) / 2 = $42,500
    // and she settles at $125,000 - $80,000, not at John's $135,000 - $80,000
    const { result } = renderUseSpouseCapFirst(
      autoSplitMock({
        effectiveCap: 42500,
        personalFactorsCap: 70000,
        hardCap: 80000,
        combinedCap: 125000,
      }),
    );

    await waitFor(() =>
      expect(result.current).toMatchObject({
        blocked: true,
        otherCap: '$45,000.00',
        otherCapRises: true,
      }),
    );
  });

  it("stops at John's combined cap when Jane's own combined cap is higher", async () => {
    // John's request is checked against his $125,000 combined cap, so the block lifts once the
    // couple passes it, at $125,000 - $80,000, before Jane reaches her own split cap
    const { result } = renderUseSpouseCapFirst({
      ...autoSplitMock({
        effectiveCap: 47500,
        personalFactorsCap: 70000,
        hardCap: 80000,
        combinedCap: 135000,
      }),
      calculations: { ...userOverMock.calculations, combinedCap: 125000 },
    });

    await waitFor(() =>
      expect(result.current).toMatchObject({
        blocked: true,
        otherCap: '$45,000.00',
        otherCapRises: false,
      }),
    );
  });

  // The split would give Jane $47,500, so her own cap below that is her effective cap already, and
  // it will not go up as she raises her salary
  it.each([
    [
      'personal factors cap',
      { personalFactorsCap: 45000, hardCap: 80000, effectiveCap: 45000 },
      '$45,000.00',
    ],
    [
      'hard cap',
      { personalFactorsCap: 70000, hardCap: 46000, effectiveCap: 46000 },
      '$46,000.00',
    ],
  ])(
    "limits an automatic split's amount to the other spouse's %s",
    async (_, caps, otherCap) => {
      const { result } = renderUseSpouseCapFirst(autoSplitMock(caps));

      await waitFor(() =>
        expect(result.current).toMatchObject({
          blocked: true,
          otherCap,
          otherCapRises: false,
        }),
      );
    },
  );

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
