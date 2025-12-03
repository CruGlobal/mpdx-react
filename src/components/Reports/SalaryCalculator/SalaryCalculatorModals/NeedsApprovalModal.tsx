import React from 'react';
import { Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SubmitModal } from '../../Shared/CalculationReports/SubmitModal/SubmitModal';

interface NeedsApprovalModalProps {
  handleClose: () => void;
  handleConfirm: () => void;
  deadlineDate?: string;
  amount?: string;
  timeFrame?: string;
  approvers?: string;
}

export const NeedsApprovalModal: React.FC<NeedsApprovalModalProps> = ({
  handleClose,
  handleConfirm,
  deadlineDate,
  amount,
  timeFrame,
  approvers,
}) => {
  const { t } = useTranslation();

  const overrideSubContent = (
    <span>
      {t('We will review your request through our')}{' '}
      <Link
        href="https://staffweb.cru.org/pay-benefits-staff-expenses/payroll/salary-calculation/progressive-approvals.html"
        target="_blank"
        rel="noopener noreferrer"
        sx={{ display: 'inline' }}
      >
        {t('Progressive Approvals')}
      </Link>{' '}
      {t(
        'process. For the {{amount}} you are requesting, this will take {{timeFrame}} as it needs to be signed off by {{approvers}}. This may affect your selected effective date.',
        {
          amount: amount || t('[Amount]'),
          timeFrame: timeFrame || t('[time frame]'),
          approvers: approvers || t('[approvers]'),
        },
      )}
    </span>
  );

  return (
    <SubmitModal
      formTitle="Salary Calculation Form"
      handleClose={handleClose}
      handleConfirm={handleConfirm}
      overrideTitle={t(
        'Your request requires additional approval because your Gross Salary exceeds your Maximum Allowable Salary. Do you want to submit it for approval?',
      )}
      overrideContent={t(
        'Requests exceeding your Maximum Allowable Salary require additional review.',
      )}
      overrideSubContent={overrideSubContent}
      deadlineDate={deadlineDate}
    />
  );
};
