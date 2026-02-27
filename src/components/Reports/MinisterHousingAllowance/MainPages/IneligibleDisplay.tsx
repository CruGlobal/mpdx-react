import { Box } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useMinisterHousingAllowance } from '../Shared/Context/MinisterHousingAllowanceContext';

export const IneligibleDisplay: React.FC = () => {
  const {
    isMarried,
    preferredName,
    spousePreferredName,
    userEligibleForMHA,
    spouseEligibleForMHA,
  } = useMinisterHousingAllowance();

  const { t } = useTranslation();

  if (!isMarried) {
    return (
      <Box mt={2} data-testid="single-ineligible">
        <Trans t={t}>
          <p style={{ lineHeight: 1.5 }}>
            You have not completed the required IBS courses to meet eligibility
            criteria.
          </p>
          <p style={{ lineHeight: 1.5, marginTop: '1em' }}>
            Once approved, when you calculate your salary, you will see the
            approved amount that can be applied to your salary. If you believe
            this is incorrect, please contact Personnel Records at{' '}
            <a href="tel:4078262230">(407) 826-2230</a> or{' '}
            <a href="mailto:MHA@cru.org">MHA@cru.org</a>.
          </p>
        </Trans>
      </Box>
    );
  }

  const bothIneligible = !userEligibleForMHA && !spouseEligibleForMHA;

  if (bothIneligible) {
    return (
      <Box mt={2} data-testid="both-ineligible">
        <Trans
          t={t}
          values={{
            preferredName,
            spousePreferredName,
          }}
        >
          <p style={{ lineHeight: 1.5 }}>
            {'{{preferredName}}'} and {'{{spousePreferredName}}'} have not
            completed the required IBS courses to meet eligibility criteria.
          </p>
          <p style={{ lineHeight: 1.5, marginTop: '1em' }}>
            Once approved, when you calculate your salary, you will see the
            approved amount that can be applied to {'{{preferredName}}'} and{' '}
            {'{{spousePreferredName}}'}&apos;s salary. If you believe this is
            incorrect, please contact Personnel Records at{' '}
            <a href="tel:4078262230">(407) 826-2230</a> or{' '}
            <a href="mailto:MHA@cru.org">MHA@cru.org</a>.
          </p>
        </Trans>
      </Box>
    );
  }

  const eligibleUserName = userEligibleForMHA
    ? preferredName
    : spousePreferredName;
  const ineligibleUserName = userEligibleForMHA
    ? spousePreferredName
    : preferredName;

  return (
    <Box mt={2} data-testid="one-ineligible">
      <Trans
        t={t}
        values={{
          eligibleUserName,
          ineligibleUserName,
        }}
      >
        <p style={{ lineHeight: 1.5 }}>
          Completing a Minister&apos;s Housing Allowance will submit the request
          for {'{{eligibleUserName}}'}. {'{{ineligibleUserName}}'} has not
          completed the required IBS courses to meet eligibility criteria.
        </p>
        <p style={{ lineHeight: 1.5, marginTop: '1em' }}>
          Once approved, when you calculate your salary, you will see the
          approved amount that can be applied to {'{{ineligibleUserName}}'}
          &apos;s salary. If you believe this is incorrect, please contact
          Personnel Records at <a href="tel:4078262230">
            (407) 826-2230
          </a> or <a href="mailto:MHA@cru.org">MHA@cru.org</a>.
        </p>
      </Trans>
    </Box>
  );
};
