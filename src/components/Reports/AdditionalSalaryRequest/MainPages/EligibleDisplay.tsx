import { Box, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';

interface EligibleDisplayProps {
  isAnyRequestPending: boolean;
}

export const EligibleDisplay: React.FC<EligibleDisplayProps> = ({
  isAnyRequestPending,
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
        {isAnyRequestPending ? (
          <Trans i18nKey="currentAsrRequest">
            <Typography sx={{ lineHeight: 1.5 }}>
              We have noted that {preferredName} currently has a pending request
              in our system. You may review the status of your additional salary
              request below. Please note that you may only process one
              additional salary request at a time.
            </Typography>
          </Trans>
        ) : (
          <Typography sx={{ lineHeight: 1.5 }}>
            <Trans i18nKey="currentApprovedAsr">
              Our records indicate that you have an approved Additional Salary
              Request. To view your ASR, click on the &quot;View Current
              ASR&quot; button below. If you would like to apply for a new ASR,
              click on the &quot;Request New ASR&quot; button below.
            </Trans>
          </Typography>
        )}
      </Box>
    </>
  );
};
