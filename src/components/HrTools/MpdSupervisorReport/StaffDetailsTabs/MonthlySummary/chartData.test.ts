import { monthlyAverages, toChartData } from './chartData';

describe('toChartData', () => {
  it('labels each month and charts missing amounts as zero', () => {
    expect(
      toChartData(
        [
          { month: '2023-01', contributions: 4000, expenses: 3500, net: 500 },
          { month: '2023-02', contributions: null, expenses: null, net: null },
        ],
        'en-US',
      ),
    ).toEqual([
      { month: 'Jan 2023', income: 4000, expenses: 3500, net: 500 },
      { month: 'Feb 2023', income: 0, expenses: 0, net: 0 },
    ]);
  });
});

describe('monthlyAverages', () => {
  // The API's last row is always the current month, still in progress.
  const currentMonth = { contributions: 900, expenses: 500 };

  it('averages contributions and expenses across the finished months', () => {
    expect(
      monthlyAverages([
        { contributions: 4000, expenses: 3500 },
        { contributions: 4200, expenses: 4500 },
        { contributions: 3200, expenses: 3100 },
        currentMonth,
      ]),
    ).toEqual({ income: 3800, expenses: 3700 });
  });

  it('leaves out the last row, even when its date is not this month', () => {
    expect(
      monthlyAverages([
        { month: '2019-11', contributions: 4000, expenses: 3000 },
        { month: '2019-12', contributions: 5000, expenses: 4000 },
        { month: '2019-12', ...currentMonth },
      ]),
    ).toEqual({ income: 4500, expenses: 3500 });
  });

  it('skips months with no amount but counts months reported as zero', () => {
    expect(
      monthlyAverages([
        { contributions: null, expenses: null },
        { contributions: 0, expenses: 1000 },
        { contributions: 3000, expenses: null },
        currentMonth,
      ]),
    ).toEqual({ income: 1500, expenses: 1000 });
  });

  it('has no average for a field with no amounts', () => {
    expect(
      monthlyAverages([
        { contributions: null, expenses: 200 },
        { contributions: undefined, expenses: 400 },
        currentMonth,
      ]),
    ).toEqual({ income: undefined, expenses: 300 });
  });
});
