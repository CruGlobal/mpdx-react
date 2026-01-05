import { HomeSharp } from '@mui/icons-material';
import { Grid, Skeleton, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { StatusCard } from '../../Shared/CalculationReports/StatusCard/StatusCard';
import { AdditionalSalaryRequestsQuery } from '../AdditionalSalaryRequest.generated';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { getRequestUrl } from '../Shared/Helper/getRequestUrl';

interface CurrentBoardApprovedProps {
  request: AdditionalSalaryRequestsQuery['additionalSalaryRequests']['nodes'][0];
}

export const CurrentBoardApproved: React.FC<CurrentBoardApprovedProps> = ({
  request,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();
  const currency = 'USD';

  const { isMarried, preferredName, spousePreferredName } =
    useAdditionalSalaryRequest();
  const requestId = request?.id;

  const { approvedDate, approvedOverallAmount, staffSpecific, spouseSpecific } =
    request?.requestAttributes || {};

  return (
    <StatusCard
      formType={t('MHA Request')}
      title={t('Current Board Approved MHA')}
      icon={HomeSharp}
      iconColor="success.main"
      linkOneText={t('View Current MHA')}
      linkOne={getRequestUrl(accountListId, requestId, 'view')}
      linkTwoText={t("Duplicate Last Year's MHA")}
      linkTwo=""
      isRequest={false}
      handleConfirmCancel={() => {}}
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {t('APPROVAL DATE')}:{' '}
            {approvedDate ? (
              dateFormatShort(DateTime.fromISO(approvedDate), locale)
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
        <Grid item xs={6}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {t('CURRENT MHA CLAIMED')}
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography
            variant="h3"
            sx={{ color: 'primary.main', fontWeight: 'bold' }}
          >
            {currencyFormat(approvedOverallAmount || 0, currency, locale, {
              showTrailingZeros: true,
            })}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1">{preferredName}</Typography>
            </Grid>
            <Grid item xs={6}>
              {isMarried && (
                <Typography variant="body1">{spousePreferredName}</Typography>
              )}
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography
                variant="h6"
                sx={{ color: 'primary.main', fontWeight: 'bold' }}
              >
                {currencyFormat(staffSpecific ?? 0, currency, locale, {
                  showTrailingZeros: true,
                })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              {isMarried && (
                <Typography
                  variant="h6"
                  sx={{ color: 'primary.main', fontWeight: 'bold' }}
                >
                  {currencyFormat(spouseSpecific ?? 0, currency, locale, {
                    showTrailingZeros: true,
                  })}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </StatusCard>
  );
};
