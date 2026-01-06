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
import { AsrStatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import { StatusCard } from '../../Shared/CalculationReports/StatusCard/StatusCard';
import { AdditionalSalaryRequestsQuery } from '../AdditionalSalaryRequest.generated';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { getRequestUrl } from '../Shared/Helper/getRequestUrl';

interface CurrentRequestProps {
  request: AdditionalSalaryRequestsQuery['additionalSalaryRequests']['nodes'][0];
}

export const CurrentRequest: React.FC<CurrentRequestProps> = ({ request }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();
  const { preferredName } = useAdditionalSalaryRequest();

  const {
    id: requestId,
    status,
    submittedDate,
    totalAdditionalSalaryRequested,
    processedDate,
  } = request;

  return (
    <StatusCard
      formType={t('ASR Request')}
      title={t("{{preferredName}}'s Pending Additional Salary Request", {
        preferredName,
      })}
      icon={AddHomeSharp}
      iconColor="warning.main"
      linkOneText={t('View Request')}
      linkOne={getRequestUrl(accountListId, requestId, 'view')}
      linkTwoText={t('Edit Request')}
      linkTwo={getRequestUrl(accountListId, requestId, 'edit')}
      isRequest={true}
      handleConfirmCancel={() => {}}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h3"
          sx={{ color: 'primary.main', fontWeight: 'bold' }}
        >
          {currencyFormat(totalAdditionalSalaryRequested || 0, 'USD', locale, {
            showTrailingZeros: true,
          })}
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
              <TimelineDot
                sx={{ bgcolor: getDotColor(status, 'submitted') }}
                variant={getDotVariant(status, 'submitted')}
              />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              {status === AsrStatusEnum.InProgress ? (
                <Typography sx={{ fontWeight: 'bold' }}>
                  {t('In Progress:')}
                </Typography>
              ) : (
                <>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {t('Requested on:')}
                  </Typography>
                  <Typography>
                    {submittedDate &&
                      `: ${dateFormat(DateTime.fromISO(submittedDate), locale)}`}
                  </Typography>
                </>
              )}
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot
                sx={{ bgcolor: getDotColor(status, 'processed') }}
                variant={getDotVariant(status, 'processed')}
              />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              {status === AsrStatusEnum.Approved ||
              status === AsrStatusEnum.ActionRequired ? (
                <>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {t('Request processed on:')}
                  </Typography>
                  <Typography>
                    {processedDate &&
                      `: ${dateFormat(DateTime.fromISO(processedDate), locale)}`}
                  </Typography>
                </>
              ) : (
                t('Request In Process')
              )}
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot
                sx={{ bgcolor: getDotColor(status, 'complete') }}
                variant={getDotVariant(status, 'complete')}
              />
            </TimelineSeparator>
            <TimelineContent>
              {status === AsrStatusEnum.ActionRequired ? (
                <>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {t('Action Required:')}{' '}
                  </Typography>
                  <Typography paragraph>{request?.feedback}</Typography>
                </>
              ) : (
                <Typography sx={{ fontWeight: 'bold' }}>
                  {t('Request Complete')}
                </Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Box>
    </StatusCard>
  );
};

// Helper to get timeline dot color based on current status and step
export const getDotColor = (
  status: AsrStatusEnum,
  step: 'submitted' | 'processed' | 'complete',
): string => {
  switch (step) {
    case 'submitted':
      if (status !== AsrStatusEnum.InProgress) {
        return 'success.main';
      }
      return 'info.main';

    case 'processed':
      if (
        status === AsrStatusEnum.Approved ||
        status === AsrStatusEnum.ActionRequired
      ) {
        return 'success.main';
      }
      if (status === AsrStatusEnum.Pending) {
        return 'info.main';
      }
      if (status === AsrStatusEnum.InProgress) {
        return 'transparent';
      }
      return 'transparent';

    case 'complete':
      if (status === AsrStatusEnum.Approved) {
        return 'success.main';
      }
      if (status === AsrStatusEnum.ActionRequired) {
        return 'warning.main';
      }
      return 'transparent';

    default:
      return 'transparent';
  }
};

// Helper to determine if dot should be filled or outlined
export const getDotVariant = (
  status: AsrStatusEnum,
  step: 'submitted' | 'processed' | 'complete',
): 'filled' | 'outlined' => {
  switch (step) {
    case 'submitted':
      return 'filled';

    case 'processed':
      if (
        status === AsrStatusEnum.Approved ||
        status === AsrStatusEnum.ActionRequired ||
        status === AsrStatusEnum.Pending
      ) {
        return 'filled';
      }
      return 'outlined';

    case 'complete':
      if (
        status === AsrStatusEnum.Approved ||
        status === AsrStatusEnum.ActionRequired
      ) {
        return 'filled';
      }
      return 'outlined';

    default:
      return 'outlined';
  }
};
