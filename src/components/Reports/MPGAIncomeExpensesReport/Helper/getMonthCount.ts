export function getMonthCount(
  months: string[],
): { year: string; count: number }[] {
  const yearsObj = months.reduce<Record<string, number>>((acc, monthYear) => {
    const year = monthYear.split(' ')[1];
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(yearsObj).map(([year, count]) => ({
    year,
    count,
  }));
}
