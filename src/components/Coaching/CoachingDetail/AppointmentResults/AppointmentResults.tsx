import { useMemo } from 'react';
import {
  Box,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableContainer,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import AnimatedCard from 'src/components/AnimatedCard';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatMonthOnly } from 'src/lib/intlFormat';
import { MultilineSkeleton } from '../../../Shared/MultilineSkeleton';
import { CoachingPeriodEnum } from '../CoachingDetail';
import { HelpButton } from '../HelpButton';
import { AlignedTableCell, HeaderRow } from '../StyledComponents';
import { useAppointmentResultsQuery } from './AppointmentResults.generated';

const ContentContainer = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  overflowX: 'scroll',
}));

interface AppointmentResultsProps {
  accountListId: string;
  period: CoachingPeriodEnum;
  currency?: string;
}

export const AppointmentResults: React.FC<AppointmentResultsProps> = ({
  accountListId,
  period,
  currency,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { data, loading } = useAppointmentResultsQuery({
    variables: {
      accountListId,
      range: period === CoachingPeriodEnum.Weekly ? '4w' : '4m',
    },
  });

  const appointmentResults = data?.appointmentResults ?? [];

  const averages = useMemo(
    () =>
      [
        'appointmentsScheduled',
        'individualAppointments',
        'monthlyDecrease',
        'monthlyIncrease',
        'newMonthlyPartners',
        'newSpecialPledges',
        'specialGifts',
      ].reduce<Record<string, number>>(
        (averages, field) => ({
          ...averages,
          [field]: appointmentResults.reduce(
            (total, period) =>
              total + period[field] / appointmentResults.length,
            0,
          ),
        }),
        {},
      ),
    [data],
  );

  return (
    <AnimatedCard>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Box flex={1}>{t("Partners & Progress - God's Part")}</Box>
            <HelpButton articleVar="HS_COACHING_APPOINTMENTS_AND_RESULTS" />
          </Box>
        }
      />
      <ContentContainer>
        {loading ? (
          <MultilineSkeleton lines={4} />
        ) : (
          <TableContainer sx={{ minWidth: 600 }}>
            <Table
              size="small"
              aria-label={t('appointments and results table')}
            >
              <TableBody>
                <HeaderRow role="rowheader">
                  <AlignedTableCell></AlignedTableCell>
                  {appointmentResults.map(({ startDate, endDate }) => (
                    <AlignedTableCell key={startDate}>
                      {period === CoachingPeriodEnum.Weekly
                        ? new Intl.DateTimeFormat(locale, {
                            month: 'short',
                            day: 'numeric',
                          }).formatRange(new Date(startDate), new Date(endDate))
                        : dateFormatMonthOnly(
                            DateTime.fromISO(startDate),
                            locale,
                          )}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>{t('Average')}</AlignedTableCell>
                </HeaderRow>
                <TableRow>
                  <AlignedTableCell>
                    {t('New Monthly Partners')}
                  </AlignedTableCell>
                  {appointmentResults.map(({ id, newMonthlyPartners }) => (
                    <AlignedTableCell key={id}>
                      {newMonthlyPartners}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages.newMonthlyPartners)}
                  </AlignedTableCell>
                </TableRow>
                <TableRow>
                  <AlignedTableCell>
                    {t('Monthly Support Gained')}
                  </AlignedTableCell>
                  {appointmentResults.map(({ id, monthlyIncrease }) => (
                    <AlignedTableCell key={id}>
                      {currencyFormat(monthlyIncrease, currency, locale)}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {currencyFormat(averages.monthlyIncrease, currency, locale)}
                  </AlignedTableCell>
                </TableRow>
                <TableRow>
                  <AlignedTableCell>
                    {t('Monthly Support Lost')}
                  </AlignedTableCell>
                  {appointmentResults.map(({ id, monthlyDecrease }) => (
                    <AlignedTableCell key={id}>
                      {currencyFormat(monthlyDecrease, currency, locale)}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {currencyFormat(averages.monthlyDecrease, currency, locale)}
                  </AlignedTableCell>
                </TableRow>
                <TableRow>
                  <AlignedTableCell>
                    {t('Special Needs Gained')}
                  </AlignedTableCell>
                  {appointmentResults.map(({ id, specialGifts }) => (
                    <AlignedTableCell key={id}>
                      {currencyFormat(specialGifts, currency, locale)}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {currencyFormat(averages.specialGifts, currency, locale)}
                  </AlignedTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </ContentContainer>
    </AnimatedCard>
  );
};
