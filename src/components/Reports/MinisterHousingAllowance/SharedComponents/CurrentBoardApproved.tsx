import { useRouter } from 'next/router';
import { HomeSharp } from '@mui/icons-material';
import {
  Grid,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { StatusCard } from '../../Shared/CalculationReports/StatusCard/StatusCard';
import { useDuplicateMinistryHousingAllowanceRequestMutation } from '../MinisterHousingAllowance.generated';
import { useMinisterHousingAllowance } from '../Shared/Context/MinisterHousingAllowanceContext';
import { getRequestUrl } from '../Shared/Helper/getRequestUrl';
import { MHARequest } from './types';

interface CurrentBoardApprovedProps {
  request: MHARequest | null;
}

export const CurrentBoardApproved: React.FC<CurrentBoardApprovedProps> = ({
  request,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();
  const router = useRouter();
  const currency = 'USD';

  const [duplicateMHA] = useDuplicateMinistryHousingAllowanceRequestMutation({
    refetchQueries: [
      'MinistryHousingAllowanceRequests',
      'MinistryHousingAllowanceRequest',
    ],
  });

  const { isMarried, preferredName, spousePreferredName } =
    useMinisterHousingAllowance();
  const requestId = request?.id;

  const { hrApprovedAt, approvedOverallAmount, staffSpecific, spouseSpecific } =
    request?.requestAttributes || {};

  const lastUpdated = request?.updatedAt ?? null;

  const handleDuplicateRequest = async () => {
    if (!requestId) {
      return;
    }

    const result = await duplicateMHA({
      variables: {
        input: {
          requestId: requestId,
        },
      },
    });

    const newRequestId =
      result.data?.duplicateMinistryHousingAllowanceRequest
        ?.ministryHousingAllowanceRequest.id;

    if (newRequestId) {
      router.push(
        `/accountLists/${accountListId}/reports/housingAllowance/${newRequestId}/edit`,
      );
    }
  };

  return (
    <StatusCard
      formType={t('MHA Request')}
      title={t('Current Board Approved MHA')}
      subtitle={t("Minister's Housing Allowance Status")}
      icon={HomeSharp}
      iconColor="success.main"
      linkOneText={t('View Current MHA')}
      linkOne={getRequestUrl(accountListId, requestId, 'view')}
      linkTwoText={t('Update Current MHA')}
      handleLinkTwo={handleDuplicateRequest}
      isRequest={false}
      handleConfirmCancel={() => {}}
      styling={{ p: 0 }}
    >
      <TableContainer sx={{ padding: 0 }}>
        <Table
          sx={{
            '& .MuiTableRow-root:last-child td': {
              border: 0,
            },
            width: '100%',
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell sx={{ fontSize: 16, fontWeight: 'bold' }}>
                {t('Spouse')}
              </TableCell>
              <TableCell sx={{ fontSize: 16, fontWeight: 'bold' }}>
                {t('MHA Approved by Board')}
              </TableCell>
              <TableCell sx={{ fontSize: 16, fontWeight: 'bold' }}>
                {t('MHA Claimed in Salary')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontSize: 20 }}>{preferredName}</TableCell>
              <TableCell>
                <Grid container direction="column">
                  <Grid item>
                    <Typography
                      sx={{ color: 'primary.main', fontWeight: 'bold' }}
                    >
                      {currencyFormat(approvedOverallAmount, currency, locale, {
                        showTrailingZeros: true,
                      })}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {t('Approved on')}:{' '}
                      {hrApprovedAt ? (
                        dateFormatShort(DateTime.fromISO(hrApprovedAt), locale)
                      ) : (
                        <Skeleton
                          width={100}
                          variant="text"
                          sx={{ ml: 1 }}
                          style={{ display: 'inline-block' }}
                        />
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </TableCell>
              <TableCell>
                <Grid container direction="column">
                  <Grid item>
                    <Typography
                      sx={{ color: 'primary.main', fontWeight: 'bold' }}
                    >
                      {currencyFormat(staffSpecific, currency, locale, {
                        showTrailingZeros: true,
                      })}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {t('Last updated')}:{' '}
                      {lastUpdated ? (
                        dateFormatShort(DateTime.fromISO(lastUpdated), locale)
                      ) : (
                        <Skeleton
                          width={100}
                          variant="text"
                          sx={{ ml: 1 }}
                          style={{ display: 'inline-block' }}
                        />
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </TableCell>
            </TableRow>
            {isMarried && (
              <TableRow>
                <TableCell sx={{ fontSize: 20 }}>
                  {spousePreferredName ? spousePreferredName : 'N/A'}
                </TableCell>
                <TableCell>
                  <Grid container direction="column">
                    <Grid item>
                      <Typography
                        sx={{ color: 'primary.main', fontWeight: 'bold' }}
                      >
                        {currencyFormat(
                          approvedOverallAmount,
                          currency,
                          locale,
                          {
                            showTrailingZeros: true,
                          },
                        )}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography sx={{ color: 'text.secondary' }}>
                        {t('Approved on')}:{' '}
                        {hrApprovedAt ? (
                          dateFormatShort(
                            DateTime.fromISO(hrApprovedAt),
                            locale,
                          )
                        ) : (
                          <Skeleton
                            width={100}
                            variant="text"
                            sx={{ ml: 1 }}
                            style={{ display: 'inline-block' }}
                          />
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </TableCell>
                <TableCell>
                  <Grid container direction="column">
                    <Grid item>
                      <Typography
                        sx={{ color: 'primary.main', fontWeight: 'bold' }}
                      >
                        {currencyFormat(spouseSpecific, currency, locale, {
                          showTrailingZeros: true,
                        })}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography sx={{ color: 'text.secondary' }}>
                        {t('Last updated')}:{' '}
                        {lastUpdated ? (
                          dateFormatShort(DateTime.fromISO(lastUpdated), locale)
                        ) : (
                          <Skeleton
                            width={100}
                            variant="text"
                            sx={{ ml: 1 }}
                            style={{ display: 'inline-block' }}
                          />
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </StatusCard>
  );
};
