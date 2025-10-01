import { TFunction } from 'i18next';
import { buildURI } from 'react-csv/lib/core';
import { currencyFormat } from 'src/lib/intlFormat';
import {
  FundTypeEnum,
  ScheduleEnum,
  TableTypeEnum,
  Transfers,
} from '../mockData';

export const createTable = (
  csvHeader: string[],
  transfers: Transfers[],
  locale: string,
) => {
  const newTransfers = transfers.map((transfer) => {
    const fromFund =
      transfer.transferFrom === FundTypeEnum.Savings
        ? 'Savings'
        : transfer.transferFrom === FundTypeEnum.Primary
          ? 'Primary'
          : transfer.transferFrom;
    const toFund =
      transfer.transferTo === FundTypeEnum.Savings
        ? 'Savings'
        : transfer.transferTo === FundTypeEnum.Primary
          ? 'Primary'
          : transfer.transferTo;
    const schedule =
      transfer.schedule === ScheduleEnum.OneTime ? 'One Time' : 'Monthly';
    const status = transfer.status
      ? transfer.status[0].toUpperCase() + transfer.status.slice(1)
      : transfer.status;
    const endDate =
      transfer.schedule === ScheduleEnum.Monthly && transfer.endDate
        ? transfer.endDate.toFormat('MMM d, yyyy')
        : '';
    return [
      fromFund,
      toFund,
      transfer.amount
        ? currencyFormat(transfer.amount, 'USD', locale, {
            showTrailingZeros: true,
          })
        : '',
      schedule,
      status,
      transfer.transferDate
        ? transfer.transferDate.toFormat('MMM d, yyyy')
        : '',
      endDate,
      transfer.note,
    ];
  });

  return [csvHeader, ...newTransfers];
};

export const downloadCSV = (
  t: TFunction,
  transfers: Transfers[],
  type: TableTypeEnum,
  locale: string,
) => {
  const title =
    type === TableTypeEnum.History
      ? t('Transfer History')
      : t('Upcoming Transfers');
  const csvHeader = [
    t('From'),
    t('To'),
    t('Amount'),
    t('Schedule'),
    t('Status'),
    t('Transfer Date'),
    t('Stop Date'),
    t('Note'),
  ];

  const csvData = createTable(csvHeader, transfers, locale);
  const csvBlob = buildURI(csvData, true);

  const link = document.createElement('a');
  link.setAttribute('href', csvBlob);
  link.setAttribute('download', title + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return csvBlob;
};
