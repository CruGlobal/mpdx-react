import { Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { mainContentWidth } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';

export const IneligiblePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAdditionalSalaryRequest();
  const reason = user?.asrEit?.ineligibilityReason;

  return (
    <Container sx={{ ml: { xs: 0, sm: 5 }, mt: 3 }}>
      <Typography sx={{ mb: 2 }} variant="h5">
        {t('Form Unavailable')}
      </Typography>
      <Typography sx={{ lineHeight: 1.5, maxWidth: mainContentWidth }}>
        {reason}
      </Typography>
    </Container>
  );
};
