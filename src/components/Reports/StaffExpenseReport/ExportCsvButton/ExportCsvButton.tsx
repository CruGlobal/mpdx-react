import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { CsvExportMenu } from '../../Shared/CsvExportMenu/CsvExportMenu';
import { ReportType } from '../Helpers/StaffReportEnum';
import { Transaction } from '../Helpers/filterTransactions';
import { createCsvReport } from './downloadReport';

export interface ExportCsvButtonProps {
  transactions: Transaction[];
}

export const ExportCsvButton: React.FC<ExportCsvButtonProps> = ({
  transactions,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const expenses = transactions.filter((transaction) => transaction.amount < 0);
  const incomes = transactions.filter((transaction) => transaction.amount > 0);

  return (
    <CsvExportMenu
      label={t('Export CSV')}
      disabled={transactions.length === 0}
      items={[
        {
          label: t('Income Report'),
          disabled: incomes.length === 0,
          onClick: () => createCsvReport(ReportType.Income, incomes, t, locale),
        },
        {
          label: t('Expense Report'),
          disabled: expenses.length === 0,
          onClick: () =>
            createCsvReport(ReportType.Expense, expenses, t, locale),
        },
        {
          label: t('Combined Report'),
          disabled: incomes.length === 0 || expenses.length === 0,
          onClick: () =>
            createCsvReport(ReportType.Combined, transactions, t, locale),
        },
      ]}
    />
  );
};
