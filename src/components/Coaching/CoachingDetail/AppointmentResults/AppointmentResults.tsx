import { useMemo } from 'react';
import {
  Box,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatWithoutYear } from 'src/lib/intlFormat';
import AnimatedCard from 'src/components/AnimatedCard';
import { MultilineSkeleton } from '../../../Shared/MultilineSkeleton';
import { CoachingPeriodEnum } from '../CoachingDetail';
import { getResultColor } from '../helpers';
import { HelpButton } from '../HelpButton';
import { useAppointmentResultsQuery } from './AppointmentResults.generated';

const ContentContainer = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  overflowX: 'scroll',
}));

const AlignedTableCell = styled(TableCell)({
  border: 'none',
  textAlign: 'right',
  ':first-of-type': {
    textAlign: 'unset',
  },
});

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
      ].reduce(
        (averages, field) => ({
          ...averages,
          [field]: data
            ? data.appointmentResults.reduce<number>((total, period) => {
                return total + period[field];
              }, 0) / data.appointmentResults.length
            : 0,
        }),
        {} as Record<string, number>,
      ),
    [data],
  );

  const appointmentGoal = CoachingPeriodEnum.Weekly ? 10 : 40;

  return (
    <AnimatedCard>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Box flex={1}>{t('Appointments and Results')}</Box>
            <HelpButton articleVar="HS_COACHING_APPOINTMENTS_AND_RESULTS" />
          </Box>
        }
      />
      <ContentContainer>
        {loading ? (
          <MultilineSkeleton lines={4} />
        ) : (
          <TableContainer sx={{ minWidth: 600 }}>
            <Table size="small" aria-label="appointments and results table">
              <TableHead>
                <TableRow>
                  <AlignedTableCell>{t('Appointments')}</AlignedTableCell>
                  {data?.appointmentResults.map(({ id, startDate }) => (
                    <AlignedTableCell key={id}>
                      {startDate &&
                        dateFormatWithoutYear(
                          DateTime.fromISO(startDate),
                          locale,
                        )}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>{t('Average')}</AlignedTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <AlignedTableCell>{t('Scheduled')}</AlignedTableCell>
                  {data?.appointmentResults.map(
                    ({ id, appointmentsScheduled }) => (
                      <AlignedTableCell
                        key={id}
                        sx={{
                          color: getResultColor(
                            appointmentsScheduled,
                            appointmentGoal,
                          ),
                        }}
                      >
                        {appointmentsScheduled}
                      </AlignedTableCell>
                    ),
                  )}
                  <AlignedTableCell
                    sx={{
                      color: getResultColor(
                        averages.appointmentsScheduled,
                        appointmentGoal,
                      ),
                    }}
                  >
                    {Math.round(averages.appointmentsScheduled)}
                  </AlignedTableCell>
                </TableRow>
                <TableRow>
                  <AlignedTableCell>
                    {t('Individual Completed')}
                  </AlignedTableCell>
                  {data?.appointmentResults.map(
                    ({ id, individualAppointments }) => (
                      <AlignedTableCell
                        key={id}
                        sx={{
                          color: getResultColor(
                            individualAppointments,
                            appointmentGoal,
                          ),
                        }}
                      >
                        {individualAppointments}
                      </AlignedTableCell>
                    ),
                  )}
                  <AlignedTableCell
                    sx={{
                      color: getResultColor(
                        averages.individualAppointments,
                        appointmentGoal,
                      ),
                    }}
                  >
                    {Math.round(averages.individualAppointments)}
                  </AlignedTableCell>
                </TableRow>
                <TableRow>
                  <AlignedTableCell
                    colSpan={(data?.appointmentResults.length ?? 0) + 2}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {t('Results')}
                  </AlignedTableCell>
                </TableRow>
                <TableRow>
                  <AlignedTableCell>
                    {t('New Monthly Partners')}
                  </AlignedTableCell>
                  {data?.appointmentResults.map(
                    ({ id, newMonthlyPartners }) => (
                      <AlignedTableCell key={id}>
                        {newMonthlyPartners}
                      </AlignedTableCell>
                    ),
                  )}
                  <AlignedTableCell>
                    {Math.round(averages.newMonthlyPartners)}
                  </AlignedTableCell>
                </TableRow>
                <TableRow>
                  <AlignedTableCell>{t('New Appeal Pledges')}</AlignedTableCell>
                  {data?.appointmentResults.map(({ id, newSpecialPledges }) => (
                    <AlignedTableCell key={id}>
                      {newSpecialPledges}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages.newSpecialPledges)}
                  </AlignedTableCell>
                </TableRow>
                <TableRow>
                  <AlignedTableCell>
                    {t('Monthly Support Gained')}
                  </AlignedTableCell>
                  {data?.appointmentResults.map(({ id, monthlyIncrease }) => (
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
                  {data?.appointmentResults.map(({ id, monthlyDecrease }) => (
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
                  {data?.appointmentResults.map(({ id, specialGifts }) => (
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
