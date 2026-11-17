import { waitFor } from '@testing-library/react';
import {
  renderUseSpouseCapFirst,
  userOverMock,
  waitForLoaded,
} from './spouseCapFirstTestUtils';

describe('useSpouseCapFirst', () => {
  it('blocks while the other spouse is under their cap', async () => {
    const { result } = renderUseSpouseCapFirst(userOverMock);

    await waitFor(() =>
      expect(result.current).toEqual({
        loaded: true,
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
      calculations: {
        ...userOverMock.calculations,
        requestedGross: 60000,
        requestedYtdGross: 60000,
      },
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

    await waitForLoaded(result);
    expect(result.current.blocked).toBe(false);
  });

  it.each([
    ['the other spouse is within $5 of their cap', {}, 49995],
    ['both spouses are over their caps', {}, 50000.01],
    [
      'the requester is exactly at their cap',
      { requestedYtdGross: 75000 },
      40000,
    ],
    [
      'the requester is over by less than a cent',
      { requestedYtdGross: 75000.004 },
      40000,
    ],
  ])('does not block when %s', async (_, calculations, spouseYtdGross) => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      calculations: { ...userOverMock.calculations, ...calculations },
      spouseCalculations: {
        requestedYtdGross: spouseYtdGross,
        effectiveCap: 50000,
      },
    });

    await waitForLoaded(result);
    expect(result.current.blocked).toBe(false);
  });

  it('blocks when the other spouse is just past $5 under their cap', async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      spouseCalculations: { requestedYtdGross: 49994.99, effectiveCap: 50000 },
    });

    await waitFor(() => expect(result.current.blocked).toBe(true));
  });

  it('does not block without a spouse', async () => {
    const { result } = renderUseSpouseCapFirst(userOverMock, {
      hasSpouse: false,
    });

    await waitForLoaded(result);
    expect(result.current.blocked).toBe(false);
  });

  it('does not block a request that is only being viewed', async () => {
    const { result } = renderUseSpouseCapFirst(userOverMock, {
      editing: false,
    });

    await waitForLoaded(result);
    expect(result.current.blocked).toBe(false);
  });

  it('does not block without an effective date, like the server', async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      effectiveDate: null,
    });

    await waitForLoaded(result);
    expect(result.current.blocked).toBe(false);
  });

  it('does not block a manual split missing a chosen cap, like the server', async () => {
    const { result } = renderUseSpouseCapFirst({
      ...userOverMock,
      splitCapRequired: true,
      manuallySplitCap: true,
      salaryCap: 75000,
      spouseSalaryCap: null,
    });

    await waitForLoaded(result);
    expect(result.current.blocked).toBe(false);
  });

  // MPDX-10360: only a raise that takes a spouse over their cap must wait for the other spouse
  describe('when the spouse over their cap is not asking for a raise', () => {
    it.each([
      ['an unchanged salary', 80000],
      ['a pay cut', 85000],
      ['a change of $5 or less, which can be rounding', 79995],
    ])('does not block %s', async (_, userCurrentGross) => {
      const { result } = renderUseSpouseCapFirst(userOverMock, {
        userCurrentGross,
      });

      await waitForLoaded(result);
      expect(result.current.blocked).toBe(false);
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

      await waitForLoaded(result);
      expect(result.current.blocked).toBe(false);
    });
  });

  it('blocks a raise of more than $5', async () => {
    const { result } = renderUseSpouseCapFirst(userOverMock, {
      userCurrentGross: 79994.99,
    });

    await waitFor(() => expect(result.current.blocked).toBe(true));
  });
});
