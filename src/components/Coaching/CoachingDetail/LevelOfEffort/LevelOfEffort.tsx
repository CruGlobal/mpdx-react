import { useMemo } from 'react';
import {
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { toLower } from 'lodash';
import { useTranslation } from 'react-i18next';
import AnimatedCard from 'src/components/AnimatedCard';
import { PhaseEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { usePhaseData } from 'src/hooks/usePhaseData';
import { snakeToCamel } from 'src/lib/snakeToCamel';
import { MultilineSkeleton } from '../../../Shared/MultilineSkeleton';
import { CoachingPeriodEnum } from '../CoachingDetail';
import {
  AlignedTableCell,
  ContentContainer,
  DividerRow,
  HeaderRow,
} from '../StyledComponents';
import { getMonthOrWeekDateRange } from '../helpers';
import { useLevelOfEffortQuery } from './LevelOfEffort.generated';

interface LevelOfEffortProps {
  accountListId: string;
  period: CoachingPeriodEnum;
}

export const LevelOfEffort: React.FC<LevelOfEffortProps> = ({
  accountListId,
  period,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { activitiesByPhase, activityTypes } = usePhaseData();

  const { data, loading } = useLevelOfEffortQuery({
    variables: {
      accountListId,
      range: period === CoachingPeriodEnum.Weekly ? '4w' : '4m',
    },
  });
  const periods = data?.reportsActivityResults?.periods.slice().reverse() ?? [];

  const averages = useMemo(
    () =>
      [
        'appointmentInPerson',
        'appointmentPhoneCall',
        'appointmentVideoCall',
        'contactsAdded',
        'contactsReferred',
        'contactsTotal',
        'followUpEmail',
        'followUpInPerson',
        'followUpPhoneCall',
        'followUpSocialMedia',
        'followUpTextMessage',
        'followUpLetterCard',
        'followUpToDo',
        'initiationEmail',
        'initiationInPerson',
        'partnerCareUpdateInformation',
        'partnerCareToDo',
        'partnerCareThank',
        'partnerCarePrayerRequest',
        'partnerCarePhysicalNewsletter',
        'partnerCareDigitalNewsletter',
        'partnerCareEmail',
        'partnerCareInPerson',
        'partnerCareLetterCard',
        'partnerCarePhoneCall',
        'partnerCareSocialMedia',
        'partnerCareTextMessage',
        'initiationSpecialGiftAppeal',
        'initiationSocialMedia',
        'initiationTextMessage',
        'initiationPhoneCall',
        'initiationLetter',
        'initiationToDo',
        'appointmentTotal',
        'followUpTotal',
        'partnerCareTotal',
        'initiationTotal',
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
      <CardHeader title={t('Level of Effort - My Part')} />
      <ContentContainer>
        {loading ? (
          <MultilineSkeleton lines={24} />
        ) : (
          <TableContainer sx={{ minWidth: 600 }}>
            <Table size="small" aria-label={t('activity summary table')}>
              <TableBody>
                <HeaderRow role="rowheader">
                  <AlignedTableCell />
                  {periods.map(({ startDate, endDate }) => (
                    <AlignedTableCell key={startDate}>
                      {getMonthOrWeekDateRange(
                        locale,
                        period,
                        startDate,
                        endDate,
                      )}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>{t('Average')}</AlignedTableCell>
                </HeaderRow>
                <HeaderRow role="rowheader">
                  <AlignedTableCell>
                    {t('New Connections Added')}
                  </AlignedTableCell>
                  {periods.map((period) => (
                    <AlignedTableCell key={period?.startDate}>
                      {period?.contactsTotal}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages?.contactsTotal)}
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
                  <AlignedTableCell>{t('Initiations')}</AlignedTableCell>
                  {periods.map((period) => (
                    <AlignedTableCell key={period?.startDate}>
                      {period?.initiationTotal}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages?.initiationTotal)}
                  </AlignedTableCell>
                </HeaderRow>
                {activitiesByPhase
                  .get(PhaseEnum.Initiation)
                  ?.map((activity) => {
                    const activityVariableName = snakeToCamel(
                      toLower(activity),
                    );
                    return typeof averages[activityVariableName] ===
                      'number' ? (
                      <TableRow>
                        <AlignedTableCell>
                          {activityTypes.get(activity)?.translatedShortName}
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
                  {periods.map((period) => (
                    <AlignedTableCell key={period?.startDate}>
                      {period?.appointmentTotal}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages?.appointmentTotal)}
                  </AlignedTableCell>
                </HeaderRow>
                {activitiesByPhase
                  .get(PhaseEnum.Appointment)
                  ?.map((activity) => {
                    const activityVariableName = snakeToCamel(
                      toLower(activity),
                    );
                    return typeof averages[activityVariableName] ===
                      'number' ? (
                      <TableRow>
                        <AlignedTableCell>
                          {activityTypes.get(activity)?.translatedShortName}
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
                  <AlignedTableCell>{t('Follow-Up')}</AlignedTableCell>
                  {periods.map((period) => (
                    <AlignedTableCell key={period?.startDate}>
                      {period?.followUpTotal}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages?.followUpTotal)}
                  </AlignedTableCell>
                </HeaderRow>
                {activitiesByPhase.get(PhaseEnum.FollowUp)?.map((activity) => {
                  const activityVariableName = snakeToCamel(toLower(activity));
                  return typeof averages[activityVariableName] === 'number' ? (
                    <TableRow>
                      <AlignedTableCell>
                        {activityTypes.get(activity)?.translatedShortName}
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
                  <AlignedTableCell>{t('Partner Care')}</AlignedTableCell>
                  {periods.map((period) => (
                    <AlignedTableCell key={period?.startDate}>
                      {period?.partnerCareTotal}
                    </AlignedTableCell>
                  ))}
                  <AlignedTableCell>
                    {Math.round(averages?.partnerCareTotal)}
                  </AlignedTableCell>
                </HeaderRow>
                {activitiesByPhase
                  .get(PhaseEnum.PartnerCare)
                  ?.map((activity) => {
                    const activityVariableName = snakeToCamel(
                      toLower(activity),
                    );
                    return typeof averages[activityVariableName] ===
                      'number' ? (
                      <TableRow>
                        <AlignedTableCell>
                          {activityTypes.get(activity)?.translatedShortName}
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
