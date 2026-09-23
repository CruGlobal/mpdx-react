import NextLink from 'next/link';
import React from 'react';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { Box, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';

export interface ViewReportLinkProps {
  staffAccountId: string;
  reportLink: 'mpgaIncomeExpenses' | 'staffExpense';
  reportName: string;
  personNumber?: string;
}

export const ViewReportLink: React.FC<ViewReportLinkProps> = ({
  staffAccountId,
  reportLink,
  reportName,
  personNumber,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <OpenInNew fontSize="small" color="action" />
      <Link
        component={NextLink}
        href={{
          pathname: `/accountLists/${accountListId}/reports/${reportLink}`,
          query: {
            staffAccountId,
            ...(personNumber && { personNumber }),
          },
        }}
        underline="hover"
      >
        {t('View {{reportName}} Report', { reportName })}
      </Link>
    </Box>
  );
};
