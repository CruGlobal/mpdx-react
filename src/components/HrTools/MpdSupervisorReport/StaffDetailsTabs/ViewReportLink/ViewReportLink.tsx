import NextLink from 'next/link';
import React from 'react';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { Box, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';

interface ViewReportLinkProps {
  staffAccountId: string | null;
  reportLink: string;
  reportName: string;
}

export const ViewReportLink: React.FC<ViewReportLinkProps> = ({
  staffAccountId,
  reportLink,
  reportName,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  if (!staffAccountId) {
    return (
      <Typography>
        {t('No staff account number is available for this staff member.')}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <OpenInNew fontSize="small" color="action" />
      <Link
        component={NextLink}
        href={`/accountLists/${accountListId}/reports/${reportLink}?staffAccountId=${encodeURIComponent(
          staffAccountId,
        )}`}
        underline="hover"
      >
        {t('View {{reportName}} Report', { reportName })}
      </Link>
    </Box>
  );
};
