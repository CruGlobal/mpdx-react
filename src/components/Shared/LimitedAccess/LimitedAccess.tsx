import Link from 'next/link';
import { Box, Button, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';

interface LimitedAccessProps {
  noStaffAccount?: boolean;
}

export const LimitedAccess: React.FC<LimitedAccessProps> = ({
  noStaffAccount,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <Container
      maxWidth="md"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h2">
          {t('Access to this feature is limited.')}
        </Typography>

        <Typography variant="h6">
          {noStaffAccount
            ? t(
                'Our records show that you do not have a staff account. You cannot access this feature if you do not have a staff account. If you think this is a mistake, please contact ',
              )
            : t(
                'Our records show that you are not part of the user group that has access to this feature. If you think this is a mistake, please contact ',
              )}
          <Link
            href="mailto:support@mpdx.org"
            style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}
          >
            support@mpdx.org
          </Link>
          {t(' to change your user group.')}
        </Typography>

        <Box sx={{ display: 'flex', mt: 2 }}>
          <Button variant="contained" href={`/accountLists/${accountListId}`}>
            {t('Back to Dashboard')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
