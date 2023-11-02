import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import { Link } from '@mui/material';
import { useGetUsersOrganizationsQuery } from './getOrganizationType.generated';

interface StaticBannerProps {
  severity?: 'error' | 'info' | 'success' | 'warning';
}

export const StaticBanner: React.FC<StaticBannerProps> = ({
  severity = 'warning',
}) => {
  const { t } = useTranslation();

  const { data, loading } = useGetUsersOrganizationsQuery();
  const nonCruUser = useMemo(() => {
    const foundCruOrg = data?.userOrganizationAccounts.find(
      (org) =>
        org.organization.organizationType === 'Cru-International' ||
        org.organization.organizationType === 'Cru',
    );
    return !foundCruOrg;
  }, [data]);

  return !loading && nonCruUser ? (
    <Alert severity={severity}>
      {t(
        `Due to data privacy regulations and costs, Cru will no longer be able to host MPDX data for non-Cru/non-CCCI ministries. `,
      )}
      <b>
        {t(
          `Your data in MPDX will be deleted if you don’t export from MPDX by January 31, 2024,`,
        )}
      </b>
      {t(
        ` or let us know why you might need an extension. For more information and to take action, read `,
      )}
      <Link
        data-testid="nonCruOrgReminder"
        href="https://docs.google.com/document/d/18TnQGmshg71l3J9Gd-4ltjIjhK2PLtuG_Vc94bt6xzE/"
        target="_blank"
        rel="noreferrer"
      >
        {t('this communication.')}
      </Link>
    </Alert>
  ) : null;
};
