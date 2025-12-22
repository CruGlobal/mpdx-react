import ImportExportIcon from '@mui/icons-material/ImportExport';
import { Box, Link, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';

export const SpouseComponent: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { hcmSpouse } = useAdditionalSalaryRequest();
  const locale = useLocale();
  const currency = 'USD';
  const { staffInfo } = hcmSpouse || {};

  const name = staffInfo?.preferredName ?? '';
  const remainingAllowableSalary = currencyFormat(12200, currency, locale);
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(1),
        }}
      >
        <ImportExportIcon
          fontSize="small"
          color="action"
          sx={{ transform: 'rotate(90deg)' }}
        />
        <Link href="#" variant="body1" underline="hover" onClick={() => {}}>
          {t('Request additional salary from {{name}}', { name })}
        </Link>
      </Box>

      <Typography variant="caption" color="text.secondary">
        {t('Up to her remaining allowable salary of {{amount}}', {
          amount: remainingAllowableSalary,
        })}
      </Typography>
    </Box>
  );
};
