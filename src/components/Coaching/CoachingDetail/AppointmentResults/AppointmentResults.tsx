import { useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatWithoutYear } from 'src/lib/intlFormat';
import { useAppointmentResultsQuery } from './AppointmentResults.generated';
import { CoachingPeriodEnum } from '../CoachingDetail';
import { MultilineSkeleton } from '../../../Shared/MultilineSkeleton';

const RootContainer = styled(Paper)(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  minWidth: '600px',
}));

const PaddedTypography = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(2),
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

  // Calculate the color of an appointment result based on how close it is to the goal of 10
  const getColor = (amount: number): string => {
    if (period === CoachingPeriodEnum.Weekly ? amount >= 10 : amount >= 40) {
      return theme.palette.statusSuccess.main;
    } else if (
      period === CoachingPeriodEnum.Weekly ? amount >= 8 : amount >= 32
    ) {
      return theme.palette.statusWarning.main;
    } else {
      return theme.palette.statusDanger.main;
    }
  };

  return (
    <RootContainer>
      <PaddedTypography variant="h6">
        {t('Appointments and Results')}
      </PaddedTypography>
      {loading ? (
        <Box sx={{ padding: 1 }}>
          <MultilineSkeleton lines={4} />
        </Box>
      ) : (
        <TableContainer>
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
                      sx={{ color: getColor(appointmentsScheduled) }}
                    >
                      {appointmentsScheduled}
                    </AlignedTableCell>
                  ),
                )}
                <AlignedTableCell
                  sx={{ color: getColor(averages.appointmentsScheduled) }}
                >
                  {Math.round(averages.appointmentsScheduled)}
                </AlignedTableCell>
              </TableRow>
              <TableRow>
                <AlignedTableCell>{t('Individual Completed')}</AlignedTableCell>
                {data?.appointmentResults.map(
                  ({ id, individualAppointments }) => (
                    <AlignedTableCell
                      key={id}
                      sx={{ color: getColor(individualAppointments) }}
                    >
                      {individualAppointments}
                    </AlignedTableCell>
                  ),
                )}
                <AlignedTableCell
                  sx={{ color: getColor(averages.individualAppointments) }}
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
                <AlignedTableCell>{t('New Monthly Partners')}</AlignedTableCell>
                {data?.appointmentResults.map(({ id, newMonthlyPartners }) => (
                  <AlignedTableCell key={id}>
                    {newMonthlyPartners}
                  </AlignedTableCell>
                ))}
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
                <AlignedTableCell>{t('Monthly Support Lost')}</AlignedTableCell>
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
                <AlignedTableCell>{t('Special Needs Gained')}</AlignedTableCell>
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
    </RootContainer>
  );
};
