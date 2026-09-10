import NextLink from 'next/link';
import React from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Alert, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { SimpleScreenOnly } from '../../styledComponents';

interface ViewOnlyBannerProps {
  staffName?: string;
  reportName?: string;
}

export const ViewOnlyBanner: React.FC<ViewOnlyBannerProps> = ({
  staffName,
  reportName,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <SimpleScreenOnly>
      <Alert
        severity="info"
        role="status"
        icon={<VisibilityIcon fontSize="inherit" />}
        action={
          <Link
            component={NextLink}
            href={`/accountLists/${accountListId}/hrTools/mpdSupervisorReport`}
            underline="hover"
          >
            {t('Back to MPD Supervisor Report')}
          </Link>
        }
        sx={{
          fontSize: '1rem',
          '& .MuiAlert-action': {
            alignItems: 'center',
            paddingTop: 0,
            marginRight: 2,
          },
        }}
      >
        {t(
          "Currently viewing {{staffName}}'s {{reportName}} report · read only.",
          {
            staffName: staffName ?? 'this staff member',
            reportName,
          },
        )}
      </Alert>
    </SimpleScreenOnly>
  );
};
