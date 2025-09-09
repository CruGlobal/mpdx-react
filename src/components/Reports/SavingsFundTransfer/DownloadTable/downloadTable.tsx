import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import { buildURI } from 'react-csv/lib/core';
import { FundTypeEnum, ScheduleEnum, TransferHistory } from '../mockData';

export const createTable = (
  csvHeader: string[],
  transfers: TransferHistory[],
  locale: string,
) => {
  const newTransfers = transfers.map((transfer) => {
    const fromFund =
      transfer.transferFrom === FundTypeEnum.Savings
        ? 'Staff Savings'
        : transfer.transferFrom === FundTypeEnum.Primary
          ? 'Staff Account'
          : transfer.transferFrom === FundTypeEnum.Conference
            ? 'Staff Conference Savings'
            : transfer.transferFrom;
    const toFund =
      transfer.transferTo === FundTypeEnum.Savings
        ? 'Staff Savings'
        : transfer.transferTo === FundTypeEnum.Primary
          ? 'Staff Account'
          : transfer.transferTo === FundTypeEnum.Conference
            ? 'Staff Conference Savings'
            : transfer.transferTo;
    const schedule =
      transfer.schedule === ScheduleEnum.OneTime ? 'One Time' : 'Monthly';
    const status = transfer.status
      ? transfer.status[0].toUpperCase() + transfer.status.slice(1)
      : transfer.status;
    const endDate =
      transfer.schedule === ScheduleEnum.Monthly
        ? transfer.endDate
          ? transfer.endDate.toLocaleString(DateTime.DATE_MED)
          : '...'
        : '';
    return [
      fromFund,
      toFund,
      transfer.amount?.toLocaleString(locale, {
        style: 'currency',
        currency: 'USD',
      }),
      schedule,
      status,
      transfer.transferDate?.toLocaleString(DateTime.DATE_MED),
      endDate,
      transfer.note,
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
