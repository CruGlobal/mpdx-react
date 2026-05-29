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

export const createTable = (
  csvHeader: string[],
  data: DataFields[],
  locale: string,
) => {
  const csvData = data.map((item) => {
    const monthlyData = item.monthly.map((monthlyAmount) =>
      monthlyAmount === 0 ? '-' : round(monthlyAmount, locale),
    );
    return [
      item.description,
      ...monthlyData,
      round(item.average, locale),
      round(item.total, locale),
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
  const title =
    reportType === ReportTypeEnum.Income
      ? 'MPGA Income Monthly Report'
      : 'MPGA Expenses Monthly Report';
  const last12Months = months.map((month) => month.split(' ')[0]);

  const monthlyTotals = data.reduce<number[]>((totals, item) => {
    item.monthly.forEach((value, index) => {
      totals[index] = (totals[index] || 0) + value;
    });
    return totals;
  }, []);

  const overallAverage = data.reduce((sum, item) => sum + item.average, 0);
  const overallTotal = data.reduce((sum, item) => sum + item.total, 0);

  const dataWithTotal: DataFields[] = [
    ...data,
    {
      id: crypto.randomUUID(),
      description: 'Overall Total',
      monthly: monthlyTotals,
      average: overallAverage,
      total: overallTotal,
    },
  ];

  const csvHeader = ['Description', ...last12Months, 'Average', 'Total'];
  const csvData = createTable(csvHeader, dataWithTotal, locale);

  const csvBlob = buildURI(csvData, true);

  const link = document.createElement('a');
  link.setAttribute('href', csvBlob);
  link.setAttribute('download', title + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return csvBlob;
};
