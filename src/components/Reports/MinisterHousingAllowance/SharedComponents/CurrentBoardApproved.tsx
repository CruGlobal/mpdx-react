import { HomeSharp } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { CardSkeleton } from '../CardSkeleton/CardSkeleton';

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
  const currency = 'USD';

  return (
    <CardSkeleton
      title={t('Current Board Approved MHA')}
      icon={HomeSharp}
      iconColor="success.main"
      titleOne={t('View Current MHA')}
      titleTwo={t('Duplicate Last Year’s MHA')}
      isRequest={false}
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body1">
            <b>
              {t(
                `APPROVAL DATE: ${dateFormatShort(DateTime.fromISO(approvedDate || ''), locale)}`,
              )}
            </b>
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <b>{t('CURRENT MHA CLAIMED')}</b>
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="h3" sx={{ color: 'primary.main' }}>
            <b>
              {currencyFormat(approvedOverallAmount || 0, currency, locale, {
                showTrailingZeros: true,
              })}
            </b>
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {staffName.split(' ')[1].toUpperCase()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                {spouseName ? spouseName.split(' ')[1].toUpperCase() : ''}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                <b>
                  {currencyFormat(staffSpecific ?? 0, currency, locale, {
                    showTrailingZeros: true,
                  })}
                </b>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                <b>
                  {spouseSpecific
                    ? currencyFormat(spouseSpecific ?? 0, currency, locale, {
                        showTrailingZeros: true,
                      })
                    : ''}
                </b>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </CardSkeleton>
  );
};
