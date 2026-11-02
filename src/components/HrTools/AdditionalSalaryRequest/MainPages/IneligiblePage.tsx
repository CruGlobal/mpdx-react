import { Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { pageContainerSx } from '../../Shared/pageContainerSx';
import { mainContentWidth } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';

export const IneligiblePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAdditionalSalaryRequest();
  const reason = user?.asrEit?.ineligibilityReason;

  return (
    <Container sx={{ ...pageContainerSx, mt: 3 }}>
      <Typography sx={{ mb: 2 }} variant="h5">
        {t('Form Unavailable')}
      </Typography>
      <Typography sx={{ lineHeight: 1.5, maxWidth: mainContentWidth }}>
        {reason}
      </Typography>
    </Container>
  );
};
