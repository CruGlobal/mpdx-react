import { ReportType } from '../Helpers/StaffReportEnum';
import { Transaction } from '../StaffExpenseReport';
import { createCsvReport } from './downloadReport';

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

const mockT = (key: string) => key;
const mockLocale = 'en-US';

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

    const incomeMockData = mockData.filter(
      (transaction) => transaction.total > 0,
    );
    createCsvReport(ReportType.Income, incomeMockData, mockT, mockLocale);

    expect(setAttributeMock).toHaveBeenCalledWith(
      'href',
      expect.stringContaining('data:text/csv'),
    );

    expect(setAttributeMock).toHaveBeenCalledWith(
      'download',
      expect.stringContaining(`Income Report.csv`),
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

    const expenseMockData = mockData.filter(
      (transaction) => transaction.total < 0,
    );
    createCsvReport(ReportType.Expense, expenseMockData, mockT, mockLocale);

    expect(setAttributeMock).toHaveBeenCalledWith(
      'href',
      expect.stringContaining('data:text/csv'),
    );

    expect(setAttributeMock).toHaveBeenCalledWith(
      'download',
      expect.stringContaining(`Expense Report.csv`),
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

    createCsvReport(ReportType.Combined, mockData, mockT, mockLocale);

    expect(setAttributeMock).toHaveBeenCalledWith(
      'href',
      expect.stringContaining('data:text/csv'),
    );

    expect(setAttributeMock).toHaveBeenCalledWith(
      'download',
      expect.stringContaining(`Combined Report.csv`),
    );
    expect(appendChildMock).toHaveBeenCalledWith(realLink);
    expect(clickMock).toHaveBeenCalled();
    expect(removeChildMock).toHaveBeenCalledWith(realLink);
  });
});
