import { Box } from '@mui/material';
import { Trans } from 'react-i18next';

interface EligibleDisplayProps {
  isPending: boolean;
}

export const EligibleDisplay: React.FC<EligibleDisplayProps> = ({
  isPending,
}) => {
  return (
    <Box>
      {isPending ? (
        <Trans i18nKey="currentMhaRequest">
          <p style={{ lineHeight: 1.5 }}>
            Our records indicate that you have an MHA request{' '}
            <strong>waiting to be processed</strong>. To view your MHA request,
            click on the &quot;View Current MHA&quot; button below. If you would
            like to make changes to your request, click on the &quot;Edit
            Request&quot; button below.
          </p>
        </Trans>
      ) : (
        <Trans i18nKey="currentApprovedMha">
          <p style={{ lineHeight: 1.5 }}>
            Our records indicate that you have an approved MHA amount. To view
            your MHA amount, click on the &quot;View Current MHA&quot; button
            below. If you would like to apply for a new MHA, click &quot;Update
            Current MHA&quot;.
          </p>
        </Trans>
      )}
    </Box>
  );
};
