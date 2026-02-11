import { Container, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';
import { mainContentWidth } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';

export const IneligiblePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAdditionalSalaryRequest();
  const reason = user?.asrEit?.ineligibilityReason;

  return (
    <Container sx={{ ml: 5, mt: 3 }}>
      <Typography sx={{ mb: 2 }} variant="h5">
        {t('Form Unavailable')}
      </Typography>
      <Stack
        direction="column"
        sx={{
          gap: theme.spacing(4),
        }}
        width={mainContentWidth}
      >
        <Typography sx={{ lineHeight: 1.5 }}>{reason}</Typography>
      </Stack>
    </Container>
  );
};
