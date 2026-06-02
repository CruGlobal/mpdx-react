import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { DataFields, mockData, months } from '../mockData';
import { createTable, exportToCsv } from './CustomExport';

const locale = 'en-US';

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

    const data = exportToCsv(
      mockData.income,
      ReportTypeEnum.Income,
      months,
      locale,
    );

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
    const csvData = createTable(mockHeaders, mockData.income, locale);

    expect(csvData).toContain(mockHeaders);
    expect(csvData[1]).toEqual([
      'Contributions',
      '6770',
      '6090',
      '5770',
      '7355',
      '8035',
      '6575',
      '7556',
      '8239',
      '9799',
      '9729',
      '13020',
      '19215',
      '9013',
      '108156',
    ]);
  });

  it('should round values to two decimal places', () => {
    const decimalData: DataFields[] = [
      {
        id: 'rounding-test',
        description: 'Rounding',
        monthly: [10.234, 10.236, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        average: 9012.567,
        total: 108155.555,
      },
    ];

    const csvData = createTable(mockHeaders, decimalData, locale);

    expect(csvData[1]).toEqual([
      'Rounding',
      '10.23',
      '10.24',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '9012.57',
      '108155.56',
    ]);
  });

  it('should display correct totals', () => {
    const csvData = createTable(mockHeaders, dataWithTotal, locale);

    expect(csvData[csvData.length - 1]).toEqual([
      'Overall Total',
      '6870',
      '6190',
      '5870',
      '7455',
      '8135',
      '6675',
      '7656',
      '8239',
      '9799',
      '9729',
      '13020',
      '19215',
      '9071',
      '108856',
    ]);
  });
});
