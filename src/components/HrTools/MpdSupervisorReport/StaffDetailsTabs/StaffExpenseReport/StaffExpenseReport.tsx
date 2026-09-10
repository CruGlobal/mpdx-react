import React from 'react';
import { useTranslation } from 'react-i18next';
import { ViewReportLink } from '../ViewReportLink/ViewReportLink';

interface StaffTabStaffExpenseReportProps {
  staffAccountId: string | null;
}

export const StaffTabStaffExpenseReport: React.FC<
  StaffTabStaffExpenseReportProps
> = ({ staffAccountId }) => {
  const { t } = useTranslation();

  return (
    <ViewReportLink
      staffAccountId={staffAccountId}
      reportLink="staffExpense"
      reportName={t('Staff Expense')}
    />
  );
};
