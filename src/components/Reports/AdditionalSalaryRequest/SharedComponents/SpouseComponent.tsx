import ImportExportIcon from '@mui/icons-material/ImportExport';
import { Box, Link, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useCreateAdditionalSalaryRequestMutation } from '../AdditionalSalaryRequest.generated';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';

export const SpouseComponent: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId();
  const currency = 'USD';

  const { requestData, spouse, isSpouse, trackMutation } =
    useAdditionalSalaryRequest();

  const [createRequest] = useCreateAdditionalSalaryRequestMutation();

  const name = spouse?.staffInfo?.preferredName ?? '';

  const { currentSalaryCap, staffAccountBalance } =
    requestData?.latestAdditionalSalaryRequest?.spouseCalculations || {};

  const spouseIndividualCap =
    (currentSalaryCap ?? 0) - (staffAccountBalance ?? 0);

  const handleRequestForSpouse = async (
    e: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    e.preventDefault();
    try {
      await trackMutation(
        createRequest({
          variables: {
            attributes: {
              phoneNumber: spouse?.staffInfo?.primaryPhoneNumber,
              emailAddress: spouse?.staffInfo?.emailAddress,
            },
            isSpouse: true,
          },
          refetchQueries: ['AdditionalSalaryRequest'],
        }),
      );
      window.location.href = `/accountLists/${accountListId}/reports/additionalSalaryRequest?isSpouse=true`;
    } catch (error) {
      enqueueSnackbar(
        t('Error creating spouse request - {{error}}', {
          error: error instanceof Error ? error.message : String(error),
        }),
        { variant: 'error' },
      );
    }
  };

  if (isSpouse || !spouse) {
    return null;
  }

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
          href="#"
          variant="body1"
          underline="hover"
          onClick={handleRequestForSpouse}
        >
          {t('Request additional salary from {{name}}', { name })}
        </Link>
      </Box>

      <Typography variant="caption" color="text.secondary">
        {t('Up to her remaining allowable salary of {{amount}}', {
          amount: currencyFormat(spouseIndividualCap, currency, locale),
        })}
      </Typography>
    </Box>
  );
};
