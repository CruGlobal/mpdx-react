import { Box, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';

interface EligibleDisplayProps {
  allRequestStatus: string;
}

export const EligibleDisplay: React.FC<EligibleDisplayProps> = ({
  allRequestStatus,
}) => {
  const { t } = useTranslation();
  const { preferredName } = useAdditionalSalaryRequest();
  return (
    <>
      <Box>
        <Typography variant="h5">
          {t('Your Additional Salary Request')}
        </Typography>
      </Box>
      <Box>
        <Trans i18nKey="pendingAsrRequest">
          {allRequestStatus === 'None' ? (
            <Typography sx={{ lineHeight: 1.5 }}>
              No Additional Salary Request has been created yet. You may create
              one by clicking the &rdquo;Create ASR&rdquo; button below. Please
              note that you may only process one additional salary request at a
              time.
            </Typography>
          ) : (
            <Typography sx={{ lineHeight: 1.5 }}>
              We have noted that {preferredName} currently has an Additional
              Salary Request with the status of {allRequestStatus} in our
              system. You may review the status of your additional salary
              request below. Please note that you may only process one
              additional salary request at a time.
            </Typography>
          )}
        </Trans>
      </Box>
    </>
  );
};
