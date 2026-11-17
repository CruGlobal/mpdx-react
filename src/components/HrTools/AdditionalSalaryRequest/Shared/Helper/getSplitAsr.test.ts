import { SplitAsrInput, getSplitAsr } from './getSplitAsr';

// The requester asks to go over their cap while their spouse still has room
const overCapInput: SplitAsrInput = {
  addsToCap: true,
  requestedAnnualSalary: 55000,
  individualCap: 50000,
  spouseCanSplit: true,
  spouseRequestedAnnualSalary: 40000,
  spouseIndividualCap: 50000,
  combinedCap: 120000,
};

describe('getSplitAsr', () => {
  it('asks the spouse to request up to their cap first', () => {
    expect(getSplitAsr(overCapInput)).toEqual({
      exceedsCap: true,
      splitAsrType: 'user',
    });
  });

  it('asks for a split when the couple lands exactly on the combined cap', () => {
    expect(getSplitAsr({ ...overCapInput, combinedCap: 95000 })).toEqual({
      exceedsCap: true,
      splitAsrType: 'user',
    });
  });

  // MPDX-10360: a couple over the combined cap goes to the normal approval levels
  it('does not ask for a split when the couple is over the combined cap', () => {
    expect(getSplitAsr({ ...overCapInput, combinedCap: 94999.99 })).toEqual({
      exceedsCap: true,
      splitAsrType: null,
    });
  });

  it('does not ask the requester to split when the couple is over the combined cap', () => {
    expect(
      getSplitAsr({
        ...overCapInput,
        requestedAnnualSalary: 40000,
        spouseRequestedAnnualSalary: 90000,
        combinedCap: 120000,
      }),
    ).toEqual({ exceedsCap: false, splitAsrType: null });
  });

  it('asks the requester to split when only the spouse is over their cap', () => {
    expect(
      getSplitAsr({
        ...overCapInput,
        requestedAnnualSalary: 40000,
        spouseRequestedAnnualSalary: 55000,
      }),
    ).toEqual({ exceedsCap: false, splitAsrType: 'spouse' });
  });

  it('keeps the split when the combined cap is unknown', () => {
    expect(getSplitAsr({ ...overCapInput, combinedCap: null })).toEqual({
      exceedsCap: true,
      splitAsrType: 'user',
    });
  });

  it('does not ask for a split when the spouse is within $5 of their cap', () => {
    expect(
      getSplitAsr({ ...overCapInput, spouseRequestedAnnualSalary: 49995 }),
    ).toEqual({ exceedsCap: true, splitAsrType: null });
  });

  it('does not ask for a split when the spouse cannot get an ASR', () => {
    expect(getSplitAsr({ ...overCapInput, spouseCanSplit: false })).toEqual({
      exceedsCap: true,
      splitAsrType: null,
    });
  });

  it('does not count a request that adds nothing to the cap', () => {
    expect(getSplitAsr({ ...overCapInput, addsToCap: false })).toEqual({
      exceedsCap: false,
      splitAsrType: null,
    });
  });
});
