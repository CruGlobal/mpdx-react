import { HomeSharp } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { CardSkeleton } from '../../Shared/CalculationReports/CardSkeleton/CardSkeleton';

interface CurrentBoardApprovedProps {
  approvedDate: string | null;
  approvedOverallAmount: number | null;
  staffName: string;
  staffSpecific: number | null;
  spouseName?: string;
  spouseSpecific?: number | null;
}

export const CurrentBoardApproved: React.FC<CurrentBoardApprovedProps> = ({
  approvedDate,
  approvedOverallAmount,
  staffName,
  staffSpecific,
  spouseName,
  spouseSpecific,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();
  const currency = 'USD';

  return (
    <CardSkeleton
      title={t('Current Board Approved MHA')}
      icon={HomeSharp}
      iconColor="success.main"
      titleOne={t('View Current MHA')}
      linkOne={`/accountLists/${accountListId}/reports/housingAllowance/view`}
      titleTwo={t("Duplicate Last Year's MHA")}
      linkTwo=""
      isRequest={false}
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {t(
              `APPROVAL DATE: ${dateFormatShort(DateTime.fromISO(approvedDate || ''), locale)}`,
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
              <Typography variant="body1">
                {staffName.split(', ')[1].toUpperCase()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                {spouseName?.split(', ')[1].toUpperCase() ?? ''}
              </Typography>
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
              <Typography
                variant="h6"
                sx={{ color: 'primary.main', fontWeight: 'bold' }}
              >
                {spouseSpecific
                  ? currencyFormat(spouseSpecific ?? 0, currency, locale, {
                      showTrailingZeros: true,
                    })
                  : ''}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </CardSkeleton>
  );
};
