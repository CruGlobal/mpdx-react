import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { ReportType } from '../Helpers/StaffReportEnum';
import { AggregationPeriod } from '../Helpers/aggregationPolicy';
import { GroupedTransaction, Transaction } from '../Helpers/filterTransactions';
import { createCsvReport } from './downloadReport';

const monthlyRollup: GroupedTransaction = {
  id: 'grouped-Primary|DONATION|2025-01',
  fundType: 'Primary',
  transactedAt: '2025-01-01',
  category: StaffExpenseCategoryEnum.Donation,
  displayCategory: 'Donations',
  description: 'Donations',
  amount: 250,
  bucketKey: 'Primary|DONATION|2025-01',
  period: AggregationPeriod.Month,
  groupedTransactions: [],
};

const mockData: Transaction[] = [
  {
    id: '1',
    category: StaffExpenseCategoryEnum.MinistryReimbursement,
    displayCategory: 'Ministry Reimbursement',
    fundType: 'Primary',
    transactedAt: '2025-10-01',
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

    const hrefValue = setAttributeMock.mock.calls.find(
      ([attribute]) => attribute === 'href',
    )?.[1];
    const csvContent = decodeURIComponent(hrefValue);
    expect(csvContent).toContain('$2,724');
    expect(csvContent).not.toContain('-$2,724');

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

  it('writes a monthly rollup as a month and year rather than a day', () => {
    const realLink = document.createElement('a');
    jest.spyOn(realLink, 'setAttribute').mockImplementation(setAttributeMock);
    jest.spyOn(realLink, 'click').mockImplementation(clickMock);

    jest.spyOn(document, 'createElement').mockReturnValue(realLink);

    createCsvReport(ReportType.Income, [monthlyRollup], mockT, mockLocale);

    const hrefValue = setAttributeMock.mock.calls.find(
      ([attribute]) => attribute === 'href',
    )?.[1];
    const csvContent = decodeURIComponent(hrefValue);
    expect(csvContent).toContain('January 2025');
    expect(csvContent).not.toContain('Jan 1, 2025');
  });

  it('writes the same description the table shows', () => {
    const realLink = document.createElement('a');
    jest.spyOn(realLink, 'setAttribute').mockImplementation(setAttributeMock);
    jest.spyOn(realLink, 'click').mockImplementation(clickMock);

    jest.spyOn(document, 'createElement').mockReturnValue(realLink);

    const transactions: Transaction[] = [
      {
        id: '4',
        category: StaffExpenseCategoryEnum.Other,
        displayCategory: 'Other',
        description: 'Conference Registration',
        fundType: 'Primary',
        transactedAt: '2025-09-02',
        amount: -150,
      },
      {
        id: '5',
        category: StaffExpenseCategoryEnum.Other,
        displayCategory: 'Other',
        description: null,
        fundType: 'Primary',
        transactedAt: '2025-09-03',
        amount: -25,
      },
    ];
    createCsvReport(ReportType.Expense, transactions, mockT, mockLocale);

    const hrefValue = setAttributeMock.mock.calls.find(
      ([attribute]) => attribute === 'href',
    )?.[1];
    const csvContent = decodeURIComponent(hrefValue);
    expect(csvContent).toContain('"Date","Description","Amount"');
    expect(csvContent).toContain('"Conference Registration","$150"');
    expect(csvContent).toContain('"Other","$25"');
  });

  it('keeps the order the table shows', () => {
    const realLink = document.createElement('a');
    jest.spyOn(realLink, 'setAttribute').mockImplementation(setAttributeMock);
    jest.spyOn(realLink, 'click').mockImplementation(clickMock);

    jest.spyOn(document, 'createElement').mockReturnValue(realLink);

    const expenses = mockData.filter((transaction) => transaction.amount < 0);
    createCsvReport(ReportType.Expense, expenses, mockT, mockLocale);

    const hrefValue = setAttributeMock.mock.calls.find(
      ([attribute]) => attribute === 'href',
    )?.[1];
    const csvContent = decodeURIComponent(hrefValue);
    expect(csvContent.indexOf('Ministry Reimbursement')).toBeLessThan(
      csvContent.indexOf('Benefits'),
    );
  });

  it('counts the pending transactions in a partly pending rollup', () => {
    const realLink = document.createElement('a');
    jest.spyOn(realLink, 'setAttribute').mockImplementation(setAttributeMock);
    jest.spyOn(realLink, 'click').mockImplementation(clickMock);

    jest.spyOn(document, 'createElement').mockReturnValue(realLink);

    const partlyPending: GroupedTransaction = {
      ...monthlyRollup,
      groupedTransactions: [
        { ...mockData[1], isPending: true },
        { ...mockData[1], id: '4', isPending: false },
      ],
    };
    createCsvReport(ReportType.Income, [partlyPending], i18n.t, mockLocale);

    const hrefValue = setAttributeMock.mock.calls.find(
      ([attribute]) => attribute === 'href',
    )?.[1];
    const csvContent = decodeURIComponent(hrefValue);
    expect(csvContent).toContain('"Donations (1 of 2 Pending)"');
  });
});
