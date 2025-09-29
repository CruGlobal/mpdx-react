import Link from 'next/link';
import { Box, Button, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';

export const NoStaffAccount: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h2">
            {t('Access to this feature is limited.')}
          </Typography>

          <Typography variant="h6">
            {t(
              'Our records show that you do not have a staff account. You cannot access this feature if you do not have a staff account. If you think this is a mistake, please contact ',
            )}
            <Link
              href="mailto:support@mpdx.org"
              style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}
            >
              support@mpdx.org
            </Link>
            .
          </Typography>

          <Box sx={{ display: 'flex', mt: 2 }}>
            <Button variant="contained" href="/">
              {t('Back to Dashboard')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
