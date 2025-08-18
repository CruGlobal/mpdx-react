export function getMonthInfo(months: string[]): {
  year: string;
  isFirstOfYear: boolean;
}[] {
  return months.map((monthYear, index) => {
    const year = monthYear.split(' ')[1];
    const isFirstOfYear =
      index === 0 || year !== months[index - 1].split(' ')[1];

    return { year, isFirstOfYear };
  });
}
