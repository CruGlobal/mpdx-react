import { AddHomeSharp } from '@mui/icons-material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@mui/lab';
import { Box, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormatShort } from 'src/lib/intlFormat';
import { CardSkeleton } from '../../Shared/CalculationReports/CardSkeleton/CardSkeleton';

interface CurrentRequestProps {
  approvedOverallAmount: number | null;
  requestedDate?: string | null;
  deadlineDate?: string | null;
  boardApprovedDate?: string | null;
  availableDate?: string | null;
}

export const CurrentRequest: React.FC<CurrentRequestProps> = ({
  approvedOverallAmount,
  requestedDate,
  deadlineDate,
  boardApprovedDate,
  availableDate,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();
  const currency = 'USD';

  //TODO: Implement real mha status logic
  return (
    <CardSkeleton
      formType={t('MHA Request')}
      title={t('Current MHA Request')}
      icon={AddHomeSharp}
      iconColor="warning.main"
      titleOne={t('View Request')}
      linkOne={`/accountLists/${accountListId}/reports/housingAllowance/view`}
      titleTwo={t('Edit Request')}
      linkTwo={`/accountLists/${accountListId}/reports/housingAllowance/edit`}
      isRequest={true}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h3" sx={{ color: 'primary.main' }}>
          <b>
            {currencyFormat(approvedOverallAmount || 0, currency, locale, {
              showTrailingZeros: true,
            })}
          </b>
        </Typography>
        <Timeline
          sx={{
            mt: 2,
            mb: -5,
            '& .MuiTimelineItem-root:before': {
              flex: 0,
              padding: 0,
            },
            '& .MuiTimelineContent-root': {
              pl: 1,
            },
          }}
        >
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot sx={{ bgcolor: 'success.main' }} />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <b>
                {t('Requested on: ')}
                {dateFormatShort(
                  DateTime.fromISO(requestedDate ?? DateTime.now().toISO()),
                  locale,
                )}
              </b>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot sx={{ bgcolor: 'info.main' }} />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <b>{t('Request in Process')}</b>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot variant="outlined" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              {t('Deadline for changes: ')}
              {dateFormatShort(
                DateTime.fromISO(deadlineDate ?? DateTime.now().toISO()),
                locale,
              )}
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot variant="outlined" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              {t('Board Approval on: ')}
              {dateFormatShort(
                DateTime.fromISO(boardApprovedDate ?? DateTime.now().toISO()),
                locale,
              )}
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot variant="outlined" />
            </TimelineSeparator>
            <TimelineContent>
              {t('MHA Available on: ')}
              {dateFormatShort(
                DateTime.fromISO(availableDate ?? DateTime.now().toISO()),
                locale,
              )}
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Box>
    </CardSkeleton>
  );
};
