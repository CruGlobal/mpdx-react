import { monthlyAverages } from './monthlyAverages';

describe('monthlyAverages', () => {
  it('averages contributions and expenses across the months', () => {
    expect(
      monthlyAverages([
        { contributions: 4000, expenses: 3500 },
        { contributions: 4200, expenses: 4500 },
        { contributions: 3200, expenses: 3100 },
      ]),
    ).toEqual({ income: 3800, expenses: 3700 });
  });

  it('skips months with no amount but counts months reported as zero', () => {
    expect(
      monthlyAverages([
        { contributions: null, expenses: null },
        { contributions: 0, expenses: 1000 },
        { contributions: 3000, expenses: null },
      ]),
    ).toEqual({ income: 1500, expenses: 1000 });
  });

  it('has no average for a field with no amounts', () => {
    expect(
      monthlyAverages([
        { contributions: null, expenses: 200 },
        { contributions: undefined, expenses: 400 },
      ]),
    ).toEqual({ income: undefined, expenses: 300 });
  });
});
