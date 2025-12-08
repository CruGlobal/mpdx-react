import { Box, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useMinisterHousingAllowance } from '../Shared/Context/MinisterHousingAllowanceContext';

export const IneligibleDisplay: React.FC = () => {
  const { t } = useTranslation();
  const { isMarried, preferredName, spousePreferredName } =
    useMinisterHousingAllowance();

  // TODO - Add spouse to API and check eligibility
  // We will get this from HCM data in the future
  const spouseEligibleForMHA = false;

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
        {isMarried && spouseEligibleForMHA === false && (
          <Box mt={2}>
            <Trans i18nKey="spouseNotEligibleMha">
              <p style={{ lineHeight: 1.5 }}>
                Completing a Minister&apos;s Housing Allowance will submit the
                request for {preferredName}. {spousePreferredName} has not
                completed the required IBS courses to meet eligibility criteria.
                When you calculate your salary, you will see the approved amount
                that can be applied to {preferredName}&apos;s salary. If you
                believe this is incorrect, please contact Personnel Records at
                407-826-2252 or <a href="mailto:MHA@cru.org">MHA@cru.org</a>.
              </p>
            </Trans>
          </Box>
        )}
      </Box>
    </>
  );
};
