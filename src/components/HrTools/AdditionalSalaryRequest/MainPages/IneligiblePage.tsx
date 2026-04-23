import { Container, Link, Stack, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
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
      <Stack direction="column" gap={4} width={mainContentWidth}>
        <Typography sx={{ lineHeight: 1.5 }}>{reason}</Typography>
        <Typography sx={{ lineHeight: 1.5 }}>
          <Trans t={t}>
            We are unable accept Additional Salary Requests at this time. Please
            contact <Link href="mailto:Payroll@cru.org">Payroll@cru.org</Link>{' '}
            if you have any questions.
          </Trans>
        </Typography>
      </Stack>
    </Container>
  );
};
