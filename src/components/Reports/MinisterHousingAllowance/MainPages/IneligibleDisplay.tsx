import { Box } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { MhiMessage } from '../../Shared/HcmData/MhiMessage';
import { isMhiUser } from '../../Shared/HcmData/mhaEligibility';
import { useMinisterHousingAllowance } from '../Shared/Context/MinisterHousingAllowanceContext';

export const IneligibleDisplay: React.FC = () => {
  const {
    isMarried,
    preferredName,
    spousePreferredName,
    userEligibleForMHA,
    spouseEligibleForMHA,
    userHcmData,
    spouseHcmData,
  } = useMinisterHousingAllowance();

  const { t } = useTranslation();

  const userIsMhi = isMhiUser(userHcmData);
  const spouseIsMhi = isMhiUser(spouseHcmData);

  if (!isMarried) {
    if (userIsMhi) {
      return (
        <Box mt={2} data-testid="mhi-ineligible">
          <MhiMessage />
        </Box>
      );
    }
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

  if (bothIneligible && userIsMhi && spouseIsMhi) {
    return (
      <Box mt={2} data-testid="mhi-ineligible">
        <MhiMessage />
      </Box>
    );
  }

  if (bothIneligible && (userIsMhi || spouseIsMhi)) {
    const mhiName = userIsMhi ? preferredName : spousePreferredName;
    const ibsName = userIsMhi ? spousePreferredName : preferredName;

    return (
      <Box mt={2} data-testid="both-ineligible-mixed">
        <Trans
          t={t}
          values={{
            mhiName,
            ibsName,
          }}
        >
          <p style={{ lineHeight: 1.5 }}>
            {'{{mhiName}}'} is in Italy and must fill out an MHI form rather
            than an MHA form. Please reach out to Personnel Records at{' '}
            <a href="tel:4078262230">(407) 826-2230</a> or{' '}
            <a href="mailto:MHA@cru.org">MHA@cru.org</a> for more information on
            the MHI form.
          </p>
          <p style={{ lineHeight: 1.5, marginTop: '1em' }}>
            {'{{ibsName}}'} has not completed the required IBS courses to meet
            eligibility criteria. For information about obtaining eligibility,
            contact Personnel Records at{' '}
            <a href="tel:4078262230">(407) 826-2230</a> or{' '}
            <a href="mailto:MHA@cru.org">MHA@cru.org</a>.
          </p>
        </Trans>
      </Box>
    );
  }

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
  const ineligibleIsMhi = userEligibleForMHA ? spouseIsMhi : userIsMhi;

  if (ineligibleIsMhi) {
    return (
      <Box mt={2} data-testid="one-mhi-ineligible">
        <Trans
          t={t}
          values={{
            eligibleUserName,
            ineligibleUserName,
          }}
        >
          <p style={{ lineHeight: 1.5 }}>
            Completing a Minister&apos;s Housing Allowance will submit the
            request for {'{{eligibleUserName}}'}. {'{{ineligibleUserName}}'} is
            in Italy and must fill out an MHI form instead. Please reach out to
            Personnel Records at <a href="tel:4078262230">(407) 826-2230</a> or{' '}
            <a href="mailto:MHA@cru.org">MHA@cru.org</a> for more information on
            the MHI form.
          </p>
        </Trans>
      </Box>
    );
  }

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
