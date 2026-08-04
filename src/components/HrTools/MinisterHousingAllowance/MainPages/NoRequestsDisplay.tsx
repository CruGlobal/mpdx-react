import { Box, Link } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

export const NoRequestsDisplay: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box data-testid="no-requests-display">
      <p style={{ lineHeight: 1.5 }}>
        <Trans t={t}>
          Our records indicate that you have not applied for Minister&apos;s
          Housing Allowance. If you would like information about applying for
          one, contact Personnel Records at{' '}
          <Link href="tel:4078262230">(407) 826-2230</Link> or{' '}
          <Link href="mailto:MHA@cru.org">MHA@cru.org</Link>.
        </Trans>
      </p>
    </Box>
  );
};
