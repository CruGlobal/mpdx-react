import ImportExportIcon from '@mui/icons-material/ImportExport';
import { Box, Link, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { useSpouseLink } from '../Shared/useSpouseLink';

export const SpouseComponent: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const locale = useLocale();
  const currency = 'USD';

  const { calculations, spouseCalculations, isSpouse, hasSpouse } =
    useAdditionalSalaryRequest();
  const { spouseLinkText, spouseLinkHref } = useSpouseLink();

  if (!hasSpouse) {
    return null;
  }

  const { currentSalaryCap, staffAccountBalance } =
    isSpouse && calculations
      ? calculations
      : spouseCalculations
        ? spouseCalculations
        : {};
  const spouseIndividualCap =
    (currentSalaryCap ?? 0) - (staffAccountBalance ?? 0);

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

        <Link href={spouseLinkHref}>{spouseLinkText}</Link>
      </Box>

      <Typography variant="caption" color="text.secondary">
        {t('Up to their remaining allowable salary of {{amount}}', {
          amount: currencyFormat(spouseIndividualCap, currency, locale),
        })}
      </Typography>
    </Box>
  );
};
