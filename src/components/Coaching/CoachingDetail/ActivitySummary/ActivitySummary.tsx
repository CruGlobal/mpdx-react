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
import { toLower } from 'lodash';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import AnimatedCard from 'src/components/AnimatedCard';
import { PhaseEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { usePhaseData } from 'src/hooks/usePhaseData';
import { dateFormatMonthOnly } from 'src/lib/intlFormat';
import { snakeToCamel } from 'src/lib/snakeToCamel';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import { MultilineSkeleton } from '../../../Shared/MultilineSkeleton';
import { CoachingPeriodEnum } from '../CoachingDetail';
import { HelpButton } from '../HelpButton';
import { AlignedTableCell, DividerRow, HeaderRow } from '../StyledComponents';
import { useActivitySummaryQuery } from './ActivitySummary.generated';

const ContentContainer = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  overflowX: 'scroll',
}));

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
  const { activitiesByPhase } = usePhaseData();

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
        'appointmentInPerson',
        'appointmentPhoneCall',
        'appointmentVideoCall',
        'contactsAdded',
        'contactsReferred',
        'followUpEmail',
        'followUpInPerson',
        'followUpPhoneCall',
        'followUpSocialMedia',
        'followUpTextMessage',
        'initiationEmail',
        'initiationInPerson',
        'partnerCareUpdateInformation',
        'partnerCareToDo',
        'partnerCareThank',
        'partnerCarePrayerRequest',
        'partnerCarePhysicalNewsletter',
        'partnerCareDigitalNewsletter',
        'initiationSpecialGiftAppeal',
        'initiationSocialMedia',
        'initiationTextMessage',
        'initiationPhoneCall',
        'initiationLetter',
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

  return (
    <AnimatedCard>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Box flex={1}>{t('Level of Effort - My Part')}</Box>
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
                  <AlignedTableCell></AlignedTableCell>
                  {periods.map(({ startDate, endDate }) => (
                    <AlignedTableCell key={startDate}>
                      {startDate &&
                        endDate &&
                        (period === CoachingPeriodEnum.Weekly
                          ? new Intl.DateTimeFormat(locale, {
                              month: 'short',
                              day: 'numeric',
                            }).formatRange(
                              new Date(startDate),
                              new Date(endDate),
                            )
                          : dateFormatMonthOnly(
                              DateTime.fromISO(startDate),
                              locale,
                            ))}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>{t('Average')}</AlignedTableCell>
                </HeaderRow>
                <HeaderRow role="rowheader">
                  <AlignedTableCell>
                    {t('New Connections Added')}
                  </AlignedTableCell>
                </HeaderRow>
                <TableRow>
                  <AlignedTableCell>{t('Namestormed')}</AlignedTableCell>
                  {periods.map((period) => (
                    <AlignedTableCell key={period?.startDate}>
                      {period?.contactsAdded}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages?.contactsAdded)}
                  </AlignedTableCell>
                </TableRow>
                <TableRow>
                  <AlignedTableCell>
                    {t('Connected by Others')}
                  </AlignedTableCell>
                  {periods.map((period) => (
                    <AlignedTableCell key={period?.startDate}>
                      {period?.contactsReferred}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages?.contactsReferred)}
                  </AlignedTableCell>
                </TableRow>
                <DividerRow>
                  <TableCell colSpan={periods.length + 2}>
                    <Divider />
                  </TableCell>
                </DividerRow>
                <HeaderRow role="rowheader">
                  <AlignedTableCell colSpan={periods.length + 2}>
                    {t('Initiations')}
                  </AlignedTableCell>
                </HeaderRow>
                {activitiesByPhase
                  .get(PhaseEnum.Initiation)
                  ?.map((activity) => {
                    const activityVariableName = snakeToCamel(toLower(activity));
                    return !isNaN(averages[activityVariableName]) &&
                      averages[activityVariableName] !== null ? (
                      <TableRow>
                        <AlignedTableCell>
                          {getLocalizedTaskType(t, activity)}
                        </AlignedTableCell>
                        {periods.map((period) => (
                          <AlignedTableCell key={period?.startDate}>
                            {period[activityVariableName]}
                          </AlignedTableCell>
                        ))}
                        <AlignedTableCell>
                          {Math.round(averages[activityVariableName])}
                        </AlignedTableCell>
                      </TableRow>
                    ) : null;
                  })}
                <DividerRow>
                  <TableCell colSpan={periods.length + 2}>
                    <Divider />
                  </TableCell>
                </DividerRow>
                <HeaderRow role="rowheader">
                  <AlignedTableCell>{t('Appointments')}</AlignedTableCell>
                </HeaderRow>
                {activitiesByPhase
                  .get(PhaseEnum.Appointment)
                  ?.map((activity) => {
                    const activityVariableName = snakeToCamel(toLower(activity));
                    return !isNaN(averages[activityVariableName]) &&
                      averages[activityVariableName] !== null ? (
                      <TableRow>
                        <AlignedTableCell>
                          {getLocalizedTaskType(t, activity)}
                        </AlignedTableCell>
                        {periods.map((period) => (
                          <AlignedTableCell key={period?.startDate}>
                            {period[activityVariableName]}
                          </AlignedTableCell>
                        ))}
                        <AlignedTableCell>
                          {Math.round(averages[activityVariableName])}
                        </AlignedTableCell>
                      </TableRow>
                    ) : null;
                  })}
                <DividerRow>
                  <TableCell colSpan={periods.length + 2}>
                    <Divider />
                  </TableCell>
                </DividerRow>
                <HeaderRow role="rowheader">
                  <AlignedTableCell colSpan={periods.length + 2}>
                    {t('Follow-Up')}
                  </AlignedTableCell>
                </HeaderRow>
                {activitiesByPhase.get(PhaseEnum.FollowUp)?.map((activity) => {
                  const activityVariableName = snakeToCamel(toLower(activity));
                  return !isNaN(averages[activityVariableName]) &&
                    averages[activityVariableName] !== null ? (
                    <TableRow>
                      <AlignedTableCell>
                        {getLocalizedTaskType(t, activity)}
                      </AlignedTableCell>
                      {periods.map((period) => (
                        <AlignedTableCell key={period?.startDate}>
                          {period[activityVariableName]}
                        </AlignedTableCell>
                      ))}
                      <AlignedTableCell>
                        {Math.round(averages[activityVariableName])}
                      </AlignedTableCell>
                    </TableRow>
                  ) : null;
                })}
                <DividerRow>
                  <TableCell colSpan={periods.length + 2}>
                    <Divider />
                  </TableCell>
                </DividerRow>
                <HeaderRow role="rowheader">
                  <AlignedTableCell colSpan={periods.length + 2}>
                    {t('Partner Care')}
                  </AlignedTableCell>
                </HeaderRow>
                {activitiesByPhase
                  .get(PhaseEnum.PartnerCare)
                  ?.map((activity) => {
                    const activityVariableName = snakeToCamel(toLower(activity));
                    return !isNaN(averages[activityVariableName]) &&
                      averages[activityVariableName] !== null ? (
                      <TableRow>
                        <AlignedTableCell>
                          {getLocalizedTaskType(t, activity)}
                        </AlignedTableCell>
                        {periods.map((period) => (
                          <AlignedTableCell key={period?.startDate}>
                            {period[activityVariableName]}
                          </AlignedTableCell>
                        ))}
                        <AlignedTableCell>
                          {Math.round(averages[activityVariableName])}
                        </AlignedTableCell>
                      </TableRow>
                    ) : null;
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </ContentContainer>
    </AnimatedCard>
  );
};
