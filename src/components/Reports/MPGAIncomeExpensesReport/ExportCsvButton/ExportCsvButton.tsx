import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { CsvExportMenu } from '../../Shared/CsvExportMenu/CsvExportMenu';
import { exportToCsv } from '../CustomExport/CustomExport';
import { ReportTypeEnum } from '../Helper/MPGAReportEnum';
import { AllData } from '../mockData';

interface ExportCsvButtonProps {
  data: AllData;
  months: string[];
}

export const ExportCsvButton: React.FC<ExportCsvButtonProps> = ({
  data,
  months,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <CsvExportMenu
      label={t('Export CSV')}
      items={[
        {
          label: t('Income'),
          disabled: !data.income.length,
          onClick: () =>
            exportToCsv(data.income, ReportTypeEnum.Income, months, locale),
        },
        {
          label: t('Expenses'),
          disabled: !data.expenses.length,
          onClick: () =>
            exportToCsv(data.expenses, ReportTypeEnum.Expenses, months, locale),
        },
      ]}
    />
  );
};
