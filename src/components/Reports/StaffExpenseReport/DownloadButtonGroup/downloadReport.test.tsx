import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import { ReportType } from '../Helpers/StaffReportEnum';
import { Transaction } from '../Helpers/filterTransactions';
import { createCsvReport } from './downloadReport';

const mockData: Transaction[] = [
  {
    id: '1',
    category: StaffExpenseCategoryEnum.MinistryReimbursement,
    displayCategory: 'Ministry Reimbursement',
    fundType: 'Primary',
    transactedAt: '2025-07-01',
    amount: -2724,
  },
  {
    id: '2',
    category: StaffExpenseCategoryEnum.Salary,
    displayCategory: 'Salary',
    fundType: 'Secondary',
    transactedAt: '2025-08-01',
    amount: 3500,
  },
  {
    id: '3',
    category: StaffExpenseCategoryEnum.Benefits,
    displayCategory: 'Benefits',
    fundType: 'Primary',
    transactedAt: '2025-09-01',
    amount: -500,
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
      (transaction) => transaction.amount > 0,
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
      (transaction) => transaction.amount < 0,
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
