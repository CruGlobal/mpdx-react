import { Box, Typography } from '@mui/material';
import { Trans } from 'react-i18next';

interface CurrentPageProps {
  title: string;
  isPending: boolean;
}

export const CurrentPage: React.FC<CurrentPageProps> = ({
  title,
  isPending,
}) => {
  return (
    <>
      <Box mb={2}>
        <Typography variant="h5">{title}</Typography>
      </Box>
      <Box>
        {isPending ? (
          <Trans i18nKey="currentMhaRequest">
            <p style={{ lineHeight: 1.5 }}>
              Our records indicate that you have an MHA request{' '}
              <strong>waiting to be processed</strong>. To view your MHA
              request, click on the &quot;View Current MHA&quot; button below.
              If you would like to make changes to your request, click on the
              &quot;Edit Request&quot; button below.
            </p>
          </Trans>
        ) : (
          <Trans i18nKey="currentApprovedMha">
            <p style={{ lineHeight: 1.5 }}>
              Our records indicate that you have an approved MHA amount. To view
              your MHA amount, click on the &quot;View Current MHA&quot; button
              below. If you would like to apply for a new MHA, click on the
              &quot;Duplicate Last Year&apos;s MHA&quot; button below or
              &quot;Request New MHA&quot; below.
            </p>
          </Trans>
        )}
      </Box>
    </>
  );
};
