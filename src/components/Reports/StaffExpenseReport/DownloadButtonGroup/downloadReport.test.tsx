import { DateTime } from 'luxon';
import { Transaction } from '../StaffExpenseReport';
import { ReportType, downloadCsv } from './downloadReport';

const mockData: Transaction[] = [
  {
    category: 'transfer - withdrawal',
    fundType: 'Primary',
    month: '2025-07-01',
    total: -2724,
    __typename: 'BreakdownByMonth',
  },
  {
    category: 'salary',
    fundType: 'Secondary',
    month: '2025-08-01',
    total: 3500,
    __typename: 'BreakdownByMonth',
  },
  {
    category: 'expense reimbursement',
    fundType: 'Primary',
    month: '2025-09-01',
    total: -500,
    __typename: 'BreakdownByMonth',
  },
];

describe('downloadReport', () => {
  describe('downloadReport', () => {
    const clickMock = jest.fn();
    const setAttributeMock = jest.fn();
    const appendChildMock = jest.spyOn(document.body, 'appendChild');
    const removeChildMock = jest.spyOn(document.body, 'removeChild');

    it('downloads an income report when ReportType.Income is passed as an argument', () => {
      const realLink = document.createElement('a');
      jest.spyOn(realLink, 'setAttribute').mockImplementation(setAttributeMock);
      jest.spyOn(realLink, 'click').mockImplementation(clickMock);

      jest.spyOn(document, 'createElement').mockReturnValue(realLink);

      downloadCsv(mockData, ReportType.Income);

      expect(setAttributeMock).toHaveBeenCalledWith(
        'href',
        expect.stringContaining('data:text/csv'),
      );

      const today = DateTime.now().toISODate();
      expect(setAttributeMock).toHaveBeenCalledWith(
        'download',
        expect.stringContaining(`Income Report ${today}.csv`),
      );
      expect(appendChildMock).toHaveBeenCalledWith(realLink);
      expect(clickMock).toHaveBeenCalled();
      expect(removeChildMock).toHaveBeenCalledWith(realLink);
    });

    it('downloads an expense report when ReportType.Expense is passed as an argument', () => {
      const realLink = document.createElement('a');
      jest.spyOn(realLink, 'setAttribute').mockImplementation(setAttributeMock);
      jest.spyOn(realLink, 'click').mockImplementation(clickMock);

      jest.spyOn(document, 'createElement').mockReturnValue(realLink);

      downloadCsv(mockData, ReportType.Expense);

      expect(setAttributeMock).toHaveBeenCalledWith(
        'href',
        expect.stringContaining('data:text/csv'),
      );

      const today = DateTime.now().toISODate();
      expect(setAttributeMock).toHaveBeenCalledWith(
        'download',
        expect.stringContaining(`Expense Report ${today}.csv`),
      );
      expect(appendChildMock).toHaveBeenCalledWith(realLink);
      expect(clickMock).toHaveBeenCalled();
      expect(removeChildMock).toHaveBeenCalledWith(realLink);
    });

    it('downloads a combined report when ReportType.Combined is passed as an argument', () => {
      const realLink = document.createElement('a');
      jest.spyOn(realLink, 'setAttribute').mockImplementation(setAttributeMock);
      jest.spyOn(realLink, 'click').mockImplementation(clickMock);

      jest.spyOn(document, 'createElement').mockReturnValue(realLink);

      downloadCsv(mockData, ReportType.Combined);

      expect(setAttributeMock).toHaveBeenCalledWith(
        'href',
        expect.stringContaining('data:text/csv'),
      );

      const today = DateTime.now().toISODate();
      expect(setAttributeMock).toHaveBeenCalledWith(
        'download',
        expect.stringContaining(`Combined Report ${today}.csv`),
      );
      expect(appendChildMock).toHaveBeenCalledWith(realLink);
      expect(clickMock).toHaveBeenCalled();
      expect(removeChildMock).toHaveBeenCalledWith(realLink);
    });

    // will probably change alert to something more user-friendly in the future
    it('alerts and returns when no transactions are provided', () => {
      const alertMock = jest
        .spyOn(window, 'alert')
        .mockImplementation(() => {});

      downloadCsv([], ReportType.Income);

      expect(alertMock).toHaveBeenCalledWith('No transactions to download');
      alertMock.mockRestore();
    });

    it('alerts and returns if transactions is undefined', () => {
      const alertMock = jest
        .spyOn(window, 'alert')
        .mockImplementation(() => {});

      downloadCsv(undefined, ReportType.Income);

      expect(alertMock).toHaveBeenCalledWith('No transactions to download');
      alertMock.mockRestore();
    });

    it('returns early if an invalid ReportType is provided', () => {
      // fix test case
      expect(downloadCsv(mockData, 'invalid' as ReportType)).toBeUndefined();
    });
  });
});
