import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { mockData, months } from '../mockData';
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

const monthlyTotals = [
  6_870, 6_190, 5_870, 7_455, 8_135, 6_675, 7_656, 8_239, 9_799, 9_729, 13_020,
  19_215,
];
const overallAverage = 9_071;
const overallTotal = 108_856;
const dataWithTotal = [
  ...mockData.income,
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

    const data = exportToCsv(mockData.income, ReportTypeEnum.Income, months);

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
    const csvData = createTable(mockHeaders, mockData.income);

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
      ...monthlyTotals,
      overallAverage,
      overallTotal,
    ]);
  });
});
