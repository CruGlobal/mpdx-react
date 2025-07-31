import { TFunction } from 'i18next';
import { buildURI } from 'react-csv/lib/core';
import { TransferHistory } from '../Table/TransferHistoryTable';
import { StaffSavingFund } from '../mockData';

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
    return [
      fromFund,
      toFund,
      transfer.amount.toLocaleString(locale, {
        style: 'currency',
        currency: 'USD',
      }),
      transfer.schedule,
      transfer.status,
      transfer.transferDate,
      transfer.stopDate,
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
