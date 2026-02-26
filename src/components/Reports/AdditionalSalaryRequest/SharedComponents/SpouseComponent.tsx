import ImportExportIcon from '@mui/icons-material/ImportExport';
import { Box, Link, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';

export const SpouseComponent: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const locale = useLocale();
  const accountListId = useAccountListId();
  const currency = 'USD';

  const { requestData, spouse, isSpouse } = useAdditionalSalaryRequest();

  const userCalculations =
    requestData?.latestAdditionalSalaryRequest?.calculations;
  const spouseCalculations =
    requestData?.latestAdditionalSalaryRequest?.spouseCalculations;
  const { currentSalaryCap, staffAccountBalance } =
    isSpouse && userCalculations
      ? userCalculations
      : spouseCalculations
        ? spouseCalculations
        : {};
  const spouseIndividualCap =
    (currentSalaryCap ?? 0) - (staffAccountBalance ?? 0);

  const name = spouse?.staffInfo?.firstName ?? '';
  const spouseLinkText = isSpouse
    ? t('Switch back to {{name}}', { name })
    : t('Request additional salary for {{name}}', { name });

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

        <Link
          href={`/accountLists/${accountListId}/reports/additionalSalaryRequest${isSpouse ? '' : '?isSpouse=true'}`}
        >
          {spouseLinkText}
        </Link>
      </Box>

      <Typography variant="caption" color="text.secondary">
        {t('Up to their remaining allowable salary of {{amount}}', {
          amount: currencyFormat(spouseIndividualCap, currency, locale),
        })}
      </Typography>
    </Box>
  );
};
