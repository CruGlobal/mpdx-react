import { Box, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useMinisterHousingAllowance } from '../Shared/Context/MinisterHousingAllowanceContext';

export const IneligibleDisplay: React.FC = () => {
  const { t } = useTranslation();
  const {
    isMarried,
    preferredName,
    spousePreferredName,
    userEligibleForMHA,
    spouseEligibleForMHA,
    hcmLoading,
  } = useMinisterHousingAllowance();

  return (
    <>
      <Box mb={2}>
        <Typography variant="h5">{t('Your MHA')}</Typography>
      </Box>
      <Box>
        <Trans
          i18nKey={isMarried ? 'newMhaRequestMarried' : 'newMhaRequestSingle'}
        >
          <p style={{ lineHeight: 1.5 }}>
            Our records indicate that you have not applied for Minister&apos;s
            Housing Allowance. If you would like information about applying for
            one, contact Personnel Records at 407-826-2252 or{' '}
            <a href="mailto:MHA@cru.org">MHA@cru.org</a>.
          </p>
        </Trans>
        {!hcmLoading &&
          isMarried &&
          userEligibleForMHA &&
          !spouseEligibleForMHA && (
            <Box mt={2} data-testid="spouse-ineligible-message">
              <Trans
                i18nKey="spouseNotEligibleMha"
                values={{ preferredName, spousePreferredName }}
              >
                <p style={{ lineHeight: 1.5 }}>
                  Completing a Minister&apos;s Housing Allowance calculation
                  form will submit the request for {preferredName}.{' '}
                  {spousePreferredName} has not completed the required IBS
                  courses to meet eligibility criteria.
                </p>
              </Trans>
            </Box>
          )}
        {!hcmLoading &&
          ((isMarried && !spouseEligibleForMHA) || !userEligibleForMHA) && (
            <Box mt={2} data-testid="user-ineligible-message">
              <Trans i18nKey="userNotEligibleMha" values={{ preferredName }}>
                <p style={{ lineHeight: 1.5 }}>
                  Once approved, when you calculate your salary, you will see
                  the approved amount that can be applied to {preferredName}
                  &apos;s salary. If you believe this is incorrect, please
                  contact Personnel Records at 407-826-2236 or{' '}
                  <a href="mailto:MHA@cru.org">MHA@cru.org</a>.
                </p>
              </Trans>
            </Box>
          )}
      </Box>
    </>
  );
};
