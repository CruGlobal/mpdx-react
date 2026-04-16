import Link from 'next/link';
import { Box, Button, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { getLimitedText } from './getLimitedText';

interface LimitedAccessProps {
  noStaffAccount?: boolean;
  userGroupError?: boolean;
}

export const LimitedAccess: React.FC<LimitedAccessProps> = ({
  noStaffAccount,
  userGroupError,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  const link = (
    <Link
      href="mailto:support@mpdx.org"
      style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}
    >
      support@mpdx.org
    </Link>
  );

  const { title, content } = getLimitedText({
    t,
    link,
    noStaffAccount,
    userGroupError,
  });

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
        <Typography variant="h2">{title}</Typography>
        <Typography variant="h6">{content}</Typography>
        <Box sx={{ display: 'flex', mt: 2 }}>
          <Button variant="contained" href={`/accountLists/${accountListId}`}>
            {t('Back to Dashboard')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
