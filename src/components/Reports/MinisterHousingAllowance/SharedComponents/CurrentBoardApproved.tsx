import { HomeSharp } from '@mui/icons-material';
import { Grid, Skeleton, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { CardSkeleton } from '../CardSkeleton/CardSkeleton';
import { MinistryHousingAllowanceRequestsQuery } from '../MinisterHousingAllowance.generated';
import { useMinisterHousingAllowance } from '../Shared/Context/MinisterHousingAllowanceContext';

interface CurrentBoardApprovedProps {
  MHARequest:
    | MinistryHousingAllowanceRequestsQuery['ministryHousingAllowanceRequests']['nodes'][0]
    | null;
}

export const CurrentBoardApproved: React.FC<CurrentBoardApprovedProps> = ({
  MHARequest,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const { isMarried, preferredName, spousePreferredName } =
    useMinisterHousingAllowance();

  const { approvedDate, approvedOverallAmount, staffSpecific, spouseSpecific } =
    MHARequest?.requestAttributes || {};

  return (
    <CardSkeleton
      title={t('Current Board Approved MHA')}
      icon={HomeSharp}
      iconColor="success.main"
      titleOne={t('View Current MHA')}
      titleTwo={t("Duplicate Last Year's MHA")}
      isRequest={false}
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
    </CardSkeleton>
  );
};
