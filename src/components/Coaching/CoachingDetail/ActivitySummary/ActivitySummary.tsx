import { useMemo } from 'react';
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatWithoutYear } from 'src/lib/intlFormat';
import AnimatedCard from 'src/components/AnimatedCard';
import { MultilineSkeleton } from '../../../Shared/MultilineSkeleton';
import { CoachingPeriodEnum } from '../CoachingDetail';
import { getResultColor } from '../helpers';
import { HelpButton } from '../HelpButton';
import { useActivitySummaryQuery } from './ActivitySummary.generated';

const DialsLabel = styled('span')(({ theme }) => ({
  padding: `${theme.spacing(0.375)} ${theme.spacing(0.75)}`,
  borderRadius: theme.spacing(0.5),
  color: theme.palette.primary.contrastText,
  fontSize: '80%',
  fontWeight: 'bold',
}));

interface DialCountProps {
  dials: number;
  goal: number;
}

const DialCount: React.FC<DialCountProps> = ({ dials, goal }) => (
  <DialsLabel sx={{ backgroundColor: getResultColor(dials, goal) }}>
    {dials}
  </DialsLabel>
);

const ContentContainer = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  overflowX: 'scroll',
}));

const DividerRow = styled(TableRow)(({ theme }) => ({
  td: {
    border: 'none',
    padding: `${theme.spacing(2)} 0`,
  },
}));

const HeaderRow = styled(TableRow)({
  td: {
    fontWeight: 'bold',
  },
});

const AlignedTableCell = styled(TableCell)({
  border: 'none',
  textAlign: 'right',
  ':first-of-type': {
    textAlign: 'unset',
  },
});

interface ActivitySummaryProps {
  accountListId: string;
  period: CoachingPeriodEnum;
}

export const ActivitySummary: React.FC<ActivitySummaryProps> = ({
  accountListId,
  period,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { data, loading } = useActivitySummaryQuery({
    variables: {
      accountListId,
      range: period === CoachingPeriodEnum.Weekly ? '4w' : '4m',
    },
  });
  const periods = data?.reportsActivityResults.periods ?? [];

  const averages = useMemo(
    () =>
      [
        'callsWithAppointmentNext',
        'completedCall',
        'completedPreCallLetter',
        'completedReminderLetter',
        'completedSupportLetter',
        'completedThank',
        'dials',
        'electronicMessageSent',
        'electronicMessageWithAppointmentNext',
      ].reduce<Record<string, number>>(
        (averages, field) => ({
          ...averages,
          [field]: periods.reduce(
            (total, period) => total + period[field] / periods.length,
            0,
          ),
        }),
        {},
      ),
    [data],
  );

  const dialGoal = period === CoachingPeriodEnum.Weekly ? 100 : 400;

  return (
    <AnimatedCard>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Box flex={1}>{t('Activity Summary')}</Box>
            <HelpButton articleVar="HS_COACHING_ACTIVITY_SUMMARY" />
          </Box>
        }
      />
      <ContentContainer>
        {loading ? (
          <MultilineSkeleton lines={4} />
        ) : (
          <TableContainer sx={{ minWidth: 600 }}>
            <Table size="small" aria-label={t('activity summary table')}>
              <TableBody>
                <HeaderRow role="rowheader">
                  <AlignedTableCell>{t('Phone Dials')}</AlignedTableCell>
                  {periods.map(({ startDate }) => (
                    <AlignedTableCell key={startDate}>
                      {dateFormatWithoutYear(
                        DateTime.fromISO(startDate),
                        locale,
                      )}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>{t('Average')}</AlignedTableCell>
                </HeaderRow>
                <TableRow>
                  <AlignedTableCell>
                    {t('Dials ({{goalText}}: {{goal}})', {
                      goalText:
                        period === CoachingPeriodEnum.Weekly
                          ? t('Weekly Goal')
                          : t('Monthly Goal'),
                      goal: dialGoal,
                    })}
                  </AlignedTableCell>
                  {periods.map(({ startDate, dials }) => (
                    <AlignedTableCell key={startDate}>
                      <DialCount dials={dials} goal={dialGoal} />
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    <DialCount
                      dials={Math.round(averages.dials)}
                      goal={dialGoal}
                    />
                  </AlignedTableCell>
                </TableRow>
                <TableRow>
                  <AlignedTableCell>{t('Completed')}</AlignedTableCell>
                  {periods.map(({ startDate, completedCall }) => (
                    <AlignedTableCell key={startDate}>
                      {completedCall}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages.completedCall)}
                  </AlignedTableCell>
                </TableRow>
                <TableRow>
                  <AlignedTableCell>
                    {t('Resulting Appointments')}
                  </AlignedTableCell>
                  {periods.map(({ startDate, callsWithAppointmentNext }) => (
                    <AlignedTableCell key={startDate}>
                      {callsWithAppointmentNext}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages.callsWithAppointmentNext)}
                  </AlignedTableCell>
                </TableRow>
                <DividerRow>
                  <TableCell colSpan={periods.length + 2}>
                    <Divider />
                  </TableCell>
                </DividerRow>
                <HeaderRow role="rowheader">
                  <AlignedTableCell colSpan={periods.length + 2}>
                    {t('Electronic Messages')}
                  </AlignedTableCell>
                </HeaderRow>
                <TableRow>
                  <AlignedTableCell>{t('Sent')}</AlignedTableCell>
                  {periods.map(({ startDate, electronicMessageSent }) => (
                    <AlignedTableCell key={startDate}>
                      {electronicMessageSent}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages.electronicMessageSent)}
                  </AlignedTableCell>
                </TableRow>
                <TableRow>
                  <AlignedTableCell>
                    {t('Resulting Appointments')}
                  </AlignedTableCell>
                  {periods.map(
                    ({ startDate, electronicMessageWithAppointmentNext }) => (
                      <AlignedTableCell key={startDate}>
                        {electronicMessageWithAppointmentNext}
                      </AlignedTableCell>
                    ),
                  )}
                  <AlignedTableCell>
                    {Math.round(averages.electronicMessageWithAppointmentNext)}
                  </AlignedTableCell>
                </TableRow>
                <DividerRow>
                  <TableCell colSpan={periods.length + 2}>
                    <Divider />
                  </TableCell>
                </DividerRow>
                <HeaderRow role="rowheader">
                  <AlignedTableCell colSpan={periods.length + 2}>
                    {t('Correspondence')}
                  </AlignedTableCell>
                </HeaderRow>
                <TableRow>
                  <AlignedTableCell>{t('Pre-Call Letters')}</AlignedTableCell>
                  {periods.map(({ startDate, completedPreCallLetter }) => (
                    <AlignedTableCell key={startDate}>
                      {completedPreCallLetter}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages.completedPreCallLetter)}
                  </AlignedTableCell>
                </TableRow>
                <TableRow>
                  <AlignedTableCell>{t('Support Letters')}</AlignedTableCell>
                  {periods.map(({ startDate, completedSupportLetter }) => (
                    <AlignedTableCell key={startDate}>
                      {completedSupportLetter}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages.completedSupportLetter)}
                  </AlignedTableCell>
                </TableRow>
                <TableRow>
                  <AlignedTableCell>{t('Thank Yous')}</AlignedTableCell>
                  {periods.map(({ startDate, completedThank }) => (
                    <AlignedTableCell key={startDate}>
                      {completedThank}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages.completedThank)}
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
