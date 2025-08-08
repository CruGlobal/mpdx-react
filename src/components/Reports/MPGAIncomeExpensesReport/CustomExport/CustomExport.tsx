import { buildURI } from 'react-csv/lib/core';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { getLast12Months } from '../Helper/getLastTwelveMonths';
import { DataFields } from '../mockData';

const createTable = (csvHeader: string[], data: DataFields[]) => {
  const csvData = data.map((item) => {
    const monthlyData = item.monthly.map((month) =>
      month === 0 ? '-' : month,
    );
    return [item.description, ...monthlyData, item.average, item.total];
  });

  return [csvHeader, ...csvData];
};

export const exportToCsv = (data: DataFields[], reportType: ReportTypeEnum) => {
  const title =
    reportType === ReportTypeEnum.Income
      ? 'MPGA Income Monthly Report'
      : 'MPGA Expenses Monthly Report';
  const last12Months = getLast12Months().map((month) => month.split(' ')[0]);

  const monthlyTotals = data.reduce((totals, item) => {
    item.monthly.forEach((value, index) => {
      totals[index] = (totals[index] || 0) + value;
    });
    return totals;
  }, [] as number[]);

  const overallAverage = data.reduce((sum, item) => sum + item.average, 0);
  const overallTotal = data.reduce((sum, item) => sum + item.total, 0);

  const dataWithTotal = [
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
  const csvData = createTable(csvHeader, dataWithTotal);

  const csvBlob = buildURI(csvData, true);

  const link = document.createElement('a');
  link.setAttribute('href', csvBlob);
  link.setAttribute('download', title + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
