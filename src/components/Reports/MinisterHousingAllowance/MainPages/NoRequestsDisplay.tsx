import { Box } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

export const NoRequestsDisplay: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box data-testid="no-requests-display">
      <Trans t={t}>
        <p style={{ lineHeight: 1.5 }}>
          Our records indicate that you have not applied for Minister&apos;s
          Housing Allowance. If you would like information about applying for
          one, contact Personnel Records at{' '}
          <a href="tel:4078262230">(407) 826-2230</a> or{' '}
          <a href="mailto:MHA@cru.org">MHA@cru.org</a>.
        </p>
      </Trans>
    </Box>
  );
};
