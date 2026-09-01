import { DateTime } from 'luxon';
import { ScheduleEnum, StatusEnum, TableTypeEnum, mockData } from '../mockData';
import { createTable, downloadCSV } from './downloadTable';

const mockT = (key: string) => key;
const mockLocale = 'en-US';

const mockSetAttribute = jest.fn();
const mockClick = jest.fn();

const mockAppendChild = jest.spyOn(document.body, 'appendChild');
const mockRemoveChild = jest.spyOn(document.body, 'removeChild');

// Must mirror downloadCSV's csvHeader; a drifted fixture hides column bugs.
const mockHeaders = [
  'From',
  'To',
  'Amount',
  'Schedule',
  'Status',
  'Start Date',
  'Next Payment Date',
  'End Date',
  'Note',
];

const mockHistory = [mockData[1]];

describe('DownloadTable', () => {
  it('should download csv file', () => {
    const link = document.createElement('a');

    jest.spyOn(document, 'createElement').mockReturnValue(link);
    jest.spyOn(link, 'setAttribute').mockImplementation(mockSetAttribute);
    jest.spyOn(link, 'click').mockImplementation(mockClick);

    const data = downloadCSV(
      mockT,
      mockHistory,
      TableTypeEnum.History,
      mockLocale,
    );

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

    expect(csvData[0]).toEqual(mockHeaders);
    expect(csvData[0]).toHaveLength(csvData[1].length);
    expect(csvData[1]).toEqual([
      'staffAccount',
      'staffSavings',
      '$1,200.00',
      'Monthly',
      StatusEnum.Ongoing.charAt(0).toUpperCase() + StatusEnum.Ongoing.slice(1),
      'Sep 25, 2023',
      '',
      'Sep 25, 2025',
      'Long-term savings',
    ]);
  });

  it('should include the next payment date of an ongoing recurring transfer', () => {
    // The global test setup pins the clock to 2020-01-01.
    const csvData = createTable(
      mockHeaders,
      [
        {
          ...mockData[1],
          transferDate: DateTime.fromISO('2019-10-15T00:00:00+00:00', {
            setZone: true,
          }),
          endDate: null,
          schedule: ScheduleEnum.Monthly,
          status: StatusEnum.Ongoing,
        },
      ],
      mockLocale,
    );

    expect(csvData[1][5]).toBe('Oct 15, 2019');
    expect(csvData[1][6]).toBe('Jan 15, 2020');
  });
});
