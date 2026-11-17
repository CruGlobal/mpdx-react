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
