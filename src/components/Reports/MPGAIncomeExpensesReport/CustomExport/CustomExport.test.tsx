import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { createTable, exportToCsv } from './CustomExport';

const mockSetAttribute = jest.fn();
const mockClick = jest.fn();

const mockAppendChild = jest.spyOn(document.body, 'appendChild');
const mockRemoveChild = jest.spyOn(document.body, 'removeChild');

const mockHeaders = [
  'Description',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
  'Jan',
  'Feb',
  'Mar',
  'Average',
  'Total',
];

const mockData = [
  {
    id: crypto.randomUUID(),
    description: 'Contributions',
    monthly: [
      6770, 6090, 5770, 7355, 8035, 6575, 7556, 8239, 9799, 9729, 13020, 19215,
    ],
    average: 9013,
    total: 108156,
  },
  {
    id: crypto.randomUUID(),
    description: 'Fr Andre, Fre to Mouna Ghar',
    monthly: [100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0],
    average: 58,
    total: 700,
  },
];

const months = [
  'Apr 2024',
  'May 2024',
  'Jun 2024',
  'Jul 2024',
  'Aug 2024',
  'Sep 2024',
  'Oct 2024',
  'Nov 2024',
  'Dec 2024',
  'Jan 2025',
  'Feb 2025',
  'Mar 2025',
];

const monthlyTotals = mockData.reduce((totals, item) => {
  item.monthly.forEach((value, index) => {
    totals[index] = (totals[index] || 0) + value;
  });
  return totals;
}, [] as number[]);

const overallAverage = mockData.reduce((sum, item) => sum + item.average, 0);
const overallTotal = mockData.reduce((sum, item) => sum + item.total, 0);
const dataWithTotal = [
  ...mockData,
  {
    id: crypto.randomUUID(),
    description: 'Overall Total',
    monthly: monthlyTotals,
    average: overallAverage,
    total: overallTotal,
  },
];

describe('CustomExport', () => {
  it('should download csv file', () => {
    const link = document.createElement('a');

    jest.spyOn(document, 'createElement').mockReturnValue(link);
    jest.spyOn(link, 'setAttribute').mockImplementation(mockSetAttribute);
    jest.spyOn(link, 'click').mockImplementation(mockClick);

    const data = exportToCsv(mockData, ReportTypeEnum.Income, months);

    expect(mockSetAttribute).toHaveBeenCalledWith(
      'href',
      expect.stringContaining('data:text/csv'),
    );
    expect(mockSetAttribute).toHaveBeenCalledWith(
      'download',
      'MPGA Income Monthly Report.csv',
    );
    expect(mockAppendChild).toHaveBeenCalledWith(link);
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(link);

    expect(data).toContain('data:text/csv');
  });

  it('should contain correct data', () => {
    const csvData = createTable(mockHeaders, mockData);

    expect(csvData).toContain(mockHeaders);
    expect(csvData[1]).toEqual([
      'Contributions',
      6770,
      6090,
      5770,
      7355,
      8035,
      6575,
      7556,
      8239,
      9799,
      9729,
      13020,
      19215,
      9013,
      108156,
    ]);
  });

  it('should display correct totals', () => {
    const csvData = createTable(mockHeaders, dataWithTotal);

    expect(csvData[csvData.length - 1]).toEqual([
      'Overall Total',
      6870,
      6190,
      5870,
      7455,
      8135,
      6675,
      7656,
      8239,
      9799,
      9729,
      13020,
      19215,
      9071,
      108856,
    ]);
  });
});
