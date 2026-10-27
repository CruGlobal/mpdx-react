import { Box } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

export interface EligibleDisplayProps {
  isPending: boolean;
  isEditable: boolean;
  isHcmApprovedOnly?: boolean;
  // False when nobody can start a new request (no current IBS certification),
  // so the text must not point at the hidden request buttons
  canRequestNewMha?: boolean;
}

export const EligibleDisplay: React.FC<EligibleDisplayProps> = ({
  isPending,
  isEditable,
  isHcmApprovedOnly,
  canRequestNewMha = true,
}) => {
  const { t } = useTranslation();

  return (
    <Box>
      {isHcmApprovedOnly && !canRequestNewMha ? (
        <p style={{ lineHeight: 1.5 }}>
          {t('Our records indicate that you have an approved MHA amount.')}
        </p>
      ) : isHcmApprovedOnly ? (
        <Trans t={t}>
          <p style={{ lineHeight: 1.5 }}>
            Our records indicate that you have an approved MHA amount. If you
            would like to apply for a new MHA, click &quot;Request New
            MHA&quot;.
          </p>
        </Trans>
      ) : isPending ? (
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
      ) : !canRequestNewMha ? (
        <Trans t={t}>
          <p style={{ lineHeight: 1.5 }}>
            Our records indicate that you have an approved MHA amount. To view
            your MHA amount, click on the &quot;View Current MHA&quot; button
            below.
          </p>
        </Trans>
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
