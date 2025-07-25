import { DateTime } from 'luxon';
import { ReportType } from '../Helpers/StaffReportEnum';
import { Transaction } from '../StaffExpenseReport';
import { downloadCsv } from './downloadReport';

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

    downloadCsv(ReportType.Income, enqueueSnackbarMock, mockData);

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
    expect(enqueueSnackbarMock).not.toHaveBeenCalled();
  });

  it('downloads an expense report when ReportType.Expense is passed as an argument', () => {
    const realLink = document.createElement('a');
    jest.spyOn(realLink, 'setAttribute').mockImplementation(setAttributeMock);
    jest.spyOn(realLink, 'click').mockImplementation(clickMock);

    jest.spyOn(document, 'createElement').mockReturnValue(realLink);

    downloadCsv(ReportType.Expense, enqueueSnackbarMock, mockData);

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
    expect(enqueueSnackbarMock).not.toHaveBeenCalled();
  });

  it('downloads a combined report when ReportType.Combined is passed as an argument', () => {
    const realLink = document.createElement('a');
    jest.spyOn(realLink, 'setAttribute').mockImplementation(setAttributeMock);
    jest.spyOn(realLink, 'click').mockImplementation(clickMock);

    jest.spyOn(document, 'createElement').mockReturnValue(realLink);

    downloadCsv(ReportType.Combined, enqueueSnackbarMock, mockData);

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
    expect(enqueueSnackbarMock).not.toHaveBeenCalled();
  });

  it('shows snackbar and returns when no transactions are provided', () => {
    downloadCsv(ReportType.Income, enqueueSnackbarMock, []);

    expect(enqueueSnackbarMock).toHaveBeenCalledWith(
      'No transactions to download',
      { variant: 'error' },
    );
  });

  it('shows snackbar and returns if transactions is undefined', () => {
    downloadCsv(ReportType.Income, enqueueSnackbarMock, undefined);

    expect(enqueueSnackbarMock).toHaveBeenCalledWith(
      'No transactions to download',
      { variant: 'error' },
    );
  });

  it('returns early if an invalid ReportType is provided', () => {
    expect(
      downloadCsv('invalid' as ReportType, enqueueSnackbarMock, []),
    ).toBeUndefined();

    expect(enqueueSnackbarMock).not.toHaveBeenCalled();
  });
});
