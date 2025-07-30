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

const mockT = jest.fn((key: string) => key);
const mockLocale = 'en-US';

describe('downloadReport', () => {
  const clickMock = jest.fn();
  const setAttributeMock = jest.fn();
  const appendChildMock = jest.spyOn(document.body, 'appendChild');
  const removeChildMock = jest.spyOn(document.body, 'removeChild');
  const enqueueSnackbarMock = jest.fn();

  it('downloads an income report when ReportType.Income is passed as an argument', () => {
    const realLink = document.createElement('a');
    jest.spyOn(realLink, 'setAttribute').mockImplementation(setAttributeMock);
    jest.spyOn(realLink, 'click').mockImplementation(clickMock);

    jest.spyOn(document, 'createElement').mockReturnValue(realLink);

    const incomeMockData = mockData.filter(
      (transaction) => transaction.total > 0,
    );
    createCsvReport(
      ReportType.Income,
      enqueueSnackbarMock,
      incomeMockData,
      mockT,
      mockLocale,
    );

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
    expect(enqueueSnackbarMock).not.toHaveBeenCalled();
  });

  it('downloads an expense report when ReportType.Expense is passed as an argument', () => {
    const realLink = document.createElement('a');
    jest.spyOn(realLink, 'setAttribute').mockImplementation(setAttributeMock);
    jest.spyOn(realLink, 'click').mockImplementation(clickMock);

    jest.spyOn(document, 'createElement').mockReturnValue(realLink);

    const expenseMockData = mockData.filter(
      (transaction) => transaction.total < 0,
    );
    createCsvReport(
      ReportType.Expense,
      enqueueSnackbarMock,
      expenseMockData,
      mockT,
      mockLocale,
    );

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
    expect(enqueueSnackbarMock).not.toHaveBeenCalled();
  });

  it('downloads a combined report when ReportType.Combined is passed as an argument', () => {
    const realLink = document.createElement('a');
    jest.spyOn(realLink, 'setAttribute').mockImplementation(setAttributeMock);
    jest.spyOn(realLink, 'click').mockImplementation(clickMock);

    jest.spyOn(document, 'createElement').mockReturnValue(realLink);

    createCsvReport(
      ReportType.Combined,
      enqueueSnackbarMock,
      mockData,
      mockT,
      mockLocale,
    );

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
    expect(enqueueSnackbarMock).not.toHaveBeenCalled();
  });

  it('shows snackbar and returns when no transactions are provided', () => {
    createCsvReport(
      ReportType.Income,
      enqueueSnackbarMock,
      [],
      mockT,
      mockLocale,
    );

    expect(enqueueSnackbarMock).toHaveBeenCalledWith(
      'No transactions to download',
      { variant: 'error' },
    );
  });

  it('returns early if an invalid ReportType is provided', () => {
    expect(
      createCsvReport(
        'invalid' as ReportType,
        enqueueSnackbarMock,
        [],
        mockT,
        mockLocale,
      ),
    ).toBeUndefined();

    expect(enqueueSnackbarMock).toHaveBeenCalled();
  });
});
