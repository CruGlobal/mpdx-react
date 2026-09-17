import React from 'react';
import { useTranslation } from 'react-i18next';
import { ViewReportLink } from '../ViewReportLink/ViewReportLink';

interface StaffTabMPGAProps {
  staffAccountId: string;
}

export const StaffTabMPGA: React.FC<StaffTabMPGAProps> = ({
  staffAccountId,
}) => {
  const { t } = useTranslation();

  return (
    <ViewReportLink
      staffAccountId={staffAccountId}
      reportLink="mpgaIncomeExpenses"
      reportName={t('MPGA')}
    />
  );
};
