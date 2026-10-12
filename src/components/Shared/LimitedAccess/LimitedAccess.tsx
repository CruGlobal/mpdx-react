import { Box, Button, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getLimitedText } from './getLimitedText';

interface LimitedAccessProps {
  noStaffAccount?: boolean;
  userGroupError?: boolean;
  notSupervisor?: boolean;
}

export const LimitedAccess: React.FC<LimitedAccessProps> = ({
  noStaffAccount,
  userGroupError,
  notSupervisor,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  const { title, content } = getLimitedText({
    t,
    noStaffAccount,
    userGroupError,
    notSupervisor,
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
