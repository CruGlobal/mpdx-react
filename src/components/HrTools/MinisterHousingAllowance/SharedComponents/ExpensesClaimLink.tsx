import { OpenInNew } from '@mui/icons-material';
import { Box, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';

// TODO: Get correct link for "What expenses can I claim on my MHA?"

export const ExpensesClaimLink: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <OpenInNew fontSize="medium" sx={{ flexShrink: 0, opacity: 0.56 }} />
      <Link component="button" type="button" sx={{ textAlign: 'left' }}>
        {t('What expenses can I claim on my MHA?')}
      </Link>
    </Box>
  );
};
