import { StatusEnum, mockData } from '../mockData';
import { createTable, downloadCSV } from './downloadTable';

const mockT = (key: string) => key;
const mockLocale = 'en-US';

const mockSetAttribute = jest.fn();
const mockClick = jest.fn();

const mockAppendChild = jest.spyOn(document.body, 'appendChild');
const mockRemoveChild = jest.spyOn(document.body, 'removeChild');

const mockHeaders = [
  'From',
  'To',
  'Amount',
  'Date',
  'Schedule',
  'Status',
  'Transfer Date',
  'Stop Date',
  'Note',
];

const mockHistory = [mockData.history[1]];

describe('DownloadTable', () => {
  it('should download csv file', () => {
    const link = document.createElement('a');

    jest.spyOn(document, 'createElement').mockReturnValue(link);
    jest.spyOn(link, 'setAttribute').mockImplementation(mockSetAttribute);
    jest.spyOn(link, 'click').mockImplementation(mockClick);

    const data = downloadCSV(mockT, mockHistory, mockLocale);

    expect(mockSetAttribute).toHaveBeenCalledWith(
      'href',
      expect.stringContaining('data:text/csv'),
    );
    expect(mockSetAttribute).toHaveBeenCalledWith(
      'download',
      'Transfer History.csv',
    );
    expect(mockAppendChild).toHaveBeenCalledWith(link);
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(link);

    expect(data).toContain('data:text/csv');
  });

  it('should contain correct data', () => {
    const csvData = createTable(mockHeaders, mockHistory, mockLocale);

    expect(csvData).toContain(mockHeaders);
    expect(csvData[1]).toEqual([
      'staffAccount',
      'staffSavings',
      '$1,200.00',
      'Monthly',
      StatusEnum.Ongoing.charAt(0).toUpperCase() + StatusEnum.Ongoing.slice(1),
      'Sep 30, 2023',
      'Sep 30, 2025',
      'Long-term savings',
    ]);
  });
});
