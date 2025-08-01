import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import { buildURI } from 'react-csv/lib/core';
import { ScheduleEnum, StaffSavingFund, TransferHistory } from '../mockData';

const createTable = (
  csvHeader: string[],
  transfers: TransferHistory[],
  locale: string,
) => {
  const newTransfers = transfers.map((transfer) => {
    const fromFund =
      transfer.transferFrom === StaffSavingFund.StaffSavings
        ? 'Staff Savings'
        : transfer.transferFrom === StaffSavingFund.StaffAccount
        ? 'Staff Account'
        : transfer.transferFrom === StaffSavingFund.StaffConferenceSavings
        ? 'Staff Conference Savings'
        : transfer.transferFrom;
    const toFund =
      transfer.transferTo === StaffSavingFund.StaffSavings
        ? 'Staff Savings'
        : transfer.transferTo === StaffSavingFund.StaffAccount
        ? 'Staff Account'
        : transfer.transferTo === StaffSavingFund.StaffConferenceSavings
        ? 'Staff Conference Savings'
        : transfer.transferTo;
    const schedule =
      transfer.schedule === ScheduleEnum.OneTime ? 'One Time' : 'Monthly';
    return [
      fromFund,
      toFund,
      transfer.amount?.toLocaleString(locale, {
        style: 'currency',
        currency: 'USD',
      }),
      schedule,
      transfer.status,
      transfer.transferDate?.toLocaleString(DateTime.DATE_MED),
      transfer.endDate?.toLocaleString(DateTime.DATE_MED),
    ];
  });

  return [csvHeader, ...newTransfers];
};

export const downloadCSV = (
  t: TFunction,
  transfers: TransferHistory[],
  locale: string,
) => {
  const title = t('Transfer History');
  const csvHeader = [
    t('From'),
    t('To'),
    t('Amount'),
    t('Schedule'),
    t('Status'),
    t('Transfer Date'),
    t('Stop Date'),
  ];

  const csvData = createTable(csvHeader, transfers, locale);
  const csvBlob = buildURI(csvData, true);

  const link = document.createElement('a');
  link.setAttribute('href', csvBlob);
  link.setAttribute('download', title + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
