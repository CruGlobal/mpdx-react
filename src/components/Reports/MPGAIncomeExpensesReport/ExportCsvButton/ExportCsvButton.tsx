import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { CsvExportMenu } from '../../Shared/CsvExportMenu/CsvExportMenu';
import { exportToCsv } from '../CustomExport/CustomExport';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { useReport } from '../ReportContext/ReportContext';

export const ExportCsvButton: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { allData: data, monthLabels } = useReport();

  return (
    <CsvExportMenu
      label={t('Export CSV')}
      items={[
        {
          label: t('Income Report'),
          disabled: !data.income.length,
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
          disabled: !data.expenses.length,
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
