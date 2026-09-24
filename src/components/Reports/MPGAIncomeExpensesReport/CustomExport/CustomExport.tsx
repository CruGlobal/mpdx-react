import { buildURI } from 'react-csv/lib/core';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { DataFields } from '../mockData';

const round = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    trailingZeroDisplay: 'stripIfInteger',
    useGrouping: false,
  }).format(value);

interface CreateTableOptions {
  monthCount?: number;
  isBalance?: boolean;
}

export const createTable = (
  csvHeader: string[],
  data: DataFields[],
  locale: string,
  { monthCount, isBalance = false }: CreateTableOptions = {},
) => {
  const csvData = data.map((item) => {
    const length = monthCount ?? item.monthly.length;
    const monthlyData = Array.from({ length }, (_, index) => {
      const monthlyAmount = item.monthly[index];
      if (monthlyAmount === undefined) {
        return '-';
      }
      if (monthlyAmount === 0) {
        return isBalance ? round(0, locale) : '-';
      }
      return round(monthlyAmount, locale);
    });

    return [
      item.description,
      ...monthlyData,
      round(item.average, locale),
      ...(isBalance ? [] : [round(item.total, locale)]),
    ];
  });

  return [csvHeader, ...csvData];
};

export const exportToCsv = (
  data: DataFields[],
  reportType: ReportTypeEnum,
  months: string[],
  locale: string,
) => {
  const title = {
    [ReportTypeEnum.Income]: 'MPGA Income Monthly Report',
    [ReportTypeEnum.Expenses]: 'MPGA Expenses Monthly Report',
    [ReportTypeEnum.Balance]: 'MPGA Primary Account Balance Monthly Report',
  }[reportType];
  const last12Months = months.map((month) => month.split(' ')[0]);

  const isBalance = reportType === ReportTypeEnum.Balance;

  const monthlyTotals = data.reduce<number[]>((totals, item) => {
    item.monthly.forEach((value, index) => {
      totals[index] = (totals[index] || 0) + value;
    });
    return totals;
  }, []);

  const overallAverage = data.reduce((sum, item) => sum + item.average, 0);
  const overallTotal = data.reduce((sum, item) => sum + item.total, 0);

  const dataWithTotal: DataFields[] = isBalance
    ? data
    : [
        ...data,
        {
          id: crypto.randomUUID(),
          description: 'Overall Total',
          monthly: monthlyTotals,
          average: overallAverage,
          total: overallTotal,
        },
      ];

  const csvHeader = [
    'Description',
    ...last12Months,
    'Average',
    ...(isBalance ? [] : ['Total']),
  ];
  const csvData = createTable(csvHeader, dataWithTotal, locale, {
    monthCount: months.length,
    isBalance,
  });

  const csvBlob = buildURI(csvData, true);

  const link = document.createElement('a');
  link.setAttribute('href', csvBlob);
  link.setAttribute('download', title + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return csvBlob;
};
