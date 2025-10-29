import { Box, Typography } from '@mui/material';
import { Trans } from 'react-i18next';
import { PersonInfo } from '../Shared/mockData';

interface NewRequestPageProps {
  title: string;
  isMarried: boolean;
  staff: PersonInfo;
  spouse?: PersonInfo | null;
}

export const NewRequestPage: React.FC<NewRequestPageProps> = ({
  title,
  isMarried,
  staff,
  spouse,
}) => {
  const name = staff.name.split(', ')[1];
  const spouseName = spouse ? spouse.name.split(', ')[1] : '';

  return (
    <>
      <Box mb={2}>
        <Typography variant="h5">{title}</Typography>
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
        {isMarried && spouse?.eligibleForMHA === false && (
          <Box mt={2}>
            <Trans i18nKey="spouseNotEligibleMha">
              <p style={{ lineHeight: 1.5 }}>
                Completing a Minister&apos;s Housing Allowance will submit the
                request for {name}. {spouseName} has not completed the required
                IBS courses to meet eligibility criteria. When you calculate
                your salary, you will see the approved amount that can be
                applied to {name}&apos;s salary.
              </p>
            </Trans>
          </Box>
        )}
      </Box>
    </>
  );
};
