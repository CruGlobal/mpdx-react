import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { CsvExportMenu } from '../../Shared/CsvExportMenu/CsvExportMenu';
import { exportToCsv } from '../CustomExport/CustomExport';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { useMPGAIncomeExpenses } from '../MPGAIncomeExpensesContext/MPGAIncomeExpensesContext';
import { useBalanceTableData } from '../Tables/useBalanceTableData';

export const ExportCsvButton: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();

  const {
    allData: data,
    dataLoading,
    reportError,
    monthLabels,
  } = useMPGAIncomeExpenses();
  const balanceData = useBalanceTableData();

  return (
    <CsvExportMenu
      label={t('Export CSV')}
      disabled={Boolean(reportError)}
      items={[
        {
          label: t('Primary Account Balance Report'),
          disabled: !balanceData.length,
          onClick: () =>
            exportToCsv(
              balanceData,
              ReportTypeEnum.Balance,
              monthLabels,
              locale,
            ),
        },
        {
          label: t('Income Report'),
          // Rows can exist before the household answers, so only the finished report is exportable.
          disabled: dataLoading || !data.income.length,
          onClick: () =>
            exportToCsv(
              data.income,
              ReportTypeEnum.Income,
              monthLabels,
              locale,
            ),
        },
        {
          label: t('Expenses Report'),
          disabled: dataLoading || !data.expenses.length,
          onClick: () =>
            exportToCsv(
              data.expenses,
              ReportTypeEnum.Expenses,
              monthLabels,
              locale,
            ),
        },
      ]}
    />
  );
};
