import { Box } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

export interface EligibleDisplayProps {
  isPending: boolean;
  isEditable: boolean;
}

export const EligibleDisplay: React.FC<EligibleDisplayProps> = ({
  isPending,
  isEditable,
}) => {
  const { t } = useTranslation();

  return (
    <Box>
      {isPending ? (
        <p style={{ lineHeight: 1.5 }}>
          <Trans t={t}>
            Our records indicate that you have an MHA request{' '}
            <strong>waiting to be processed</strong>. To view your MHA request,
            click on the &quot;View Current MHA&quot; button below.
          </Trans>
          {isEditable && (
            <Trans t={t}>
              If you would like to make changes to your request, click on the
              &quot;Edit Request&quot; button below.
            </Trans>
          )}
        </p>
      ) : (
        <Trans t={t}>
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
