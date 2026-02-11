import React from 'react';
import { Box, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';

export const EligibleDisplay: React.FC = () => {
  const { t } = useTranslation();
  const { user, requestData } = useAdditionalSalaryRequest();
  const preferredName = user?.staffInfo?.preferredName;
  const { status } = requestData?.latestAdditionalSalaryRequest || {};

  return (
    <>
      <Box>
        <Typography variant="h5">
          {t('Your Additional Salary Request')}
        </Typography>
      </Box>
      <Box>
        {status === AsrStatusEnum.Pending && (
          <Typography sx={{ lineHeight: 1.5 }}>
            <Trans t={t}>
              We have noted that {{ preferredName }} currently has a pending
              request in our system. You may review the status of your
              additional salary request below. Please note that you may only
              process one additional salary request at a time.
            </Trans>
          </Typography>
        )}
        {status === AsrStatusEnum.ActionRequired && (
          <Typography sx={{ lineHeight: 1.5 }}>
            <Trans t={t}>
              Action is required to complete your pending request. Please see
              the details below.
            </Trans>
          </Typography>
        )}
      </Box>
    </>
  );
};
