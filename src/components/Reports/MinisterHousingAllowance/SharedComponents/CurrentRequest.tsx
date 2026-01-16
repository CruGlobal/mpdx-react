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
import { MhaStatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import { StatusCard } from '../../Shared/CalculationReports/StatusCard/StatusCard';
import { getRequestUrl } from '../Shared/Helper/getRequestUrl';
import { MHARequest } from './types';

interface CurrentRequestProps {
  request: MHARequest;
}

export const CurrentRequest: React.FC<CurrentRequestProps> = ({ request }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();
  const currency = 'USD';

  const requestId = request.id;

  const { status, requestAttributes } = request;

  const {
    boardApprovedAt,
    deadlineDate,
    submittedAt,
    availableDate,
    approvedOverallAmount,
  } = requestAttributes || {};

  return (
    <StatusCard
      formType={t('MHA Request')}
      title={t('Current MHA Request')}
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
              <TimelineDot
                sx={{ bgcolor: getDotColor(status, 'submitted') }}
                variant={getDotVariant(status, 'submitted')}
              />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <b>
                {status === MhaStatusEnum.InProgress ? (
                  t('Currently Editing')
                ) : (
                  <>
                    {t('Requested on')}
                    {submittedAt &&
                      `: ${dateFormat(DateTime.fromISO(submittedAt), locale)}`}
                  </>
                )}
              </b>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot
                sx={{ bgcolor: getDotColor(status, 'inProcess') }}
                variant={getDotVariant(status, 'inProcess')}
              />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <b>
                {status === MhaStatusEnum.ActionRequired
                  ? t('Action Required')
                  : t('Request in Process')}
              </b>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot
                sx={{ bgcolor: getDotColor(status, 'deadline') }}
                variant={getDotVariant(status, 'deadline')}
              />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <b>
                {t('Deadline for changes')}
                {deadlineDate &&
                  `: ${dateFormat(DateTime.fromISO(deadlineDate), locale)}`}
              </b>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot
                sx={{ bgcolor: getDotColor(status, 'boardApproval') }}
                variant={getDotVariant(status, 'boardApproval')}
              />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <b>
                {t('Board Approval on')}
                {boardApprovedAt &&
                  `: ${dateFormat(DateTime.fromISO(boardApprovedAt), locale)}`}
              </b>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot
                sx={{ bgcolor: getDotColor(status, 'available') }}
                variant={getDotVariant(status, 'available')}
              />
            </TimelineSeparator>
            <TimelineContent>
              <b>
                {t('MHA Available on')}
                {availableDate &&
                  `: ${dateFormat(DateTime.fromISO(availableDate), locale)}`}
              </b>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Box>
    </StatusCard>
  );
};

// Helper to get timeline dot color based on current status and step
export const getDotColor = (
  status: MhaStatusEnum,
  step: 'submitted' | 'inProcess' | 'deadline' | 'boardApproval' | 'available',
): string => {
  switch (step) {
    case 'submitted':
      return status === MhaStatusEnum.InProgress ? 'info.main' : 'success.main';

    case 'inProcess':
      if (status === MhaStatusEnum.Pending) {
        return 'info.main';
      }
      if (status === MhaStatusEnum.InProgress) {
        return 'transparent';
      }
      if (status === MhaStatusEnum.ActionRequired) {
        return 'warning.main';
      }
      return 'success.main';

    case 'deadline':
      if (status === MhaStatusEnum.Pending) {
        return 'info.main';
      }
      if (
        status === MhaStatusEnum.InProgress ||
        status === MhaStatusEnum.ActionRequired
      ) {
        return 'transparent';
      }
      return 'success.main';

    case 'boardApproval':
      if (status === MhaStatusEnum.HrApproved) {
        return 'info.main';
      }
      if (status === MhaStatusEnum.BoardApproved) {
        return 'success.main';
      }
      return 'transparent';

    case 'available':
    default:
      return 'transparent';
  }
};

// Helper to determine if dot should be filled or outlined
export const getDotVariant = (
  status: MhaStatusEnum,
  step: 'submitted' | 'inProcess' | 'deadline' | 'boardApproval' | 'available',
): 'filled' | 'outlined' => {
  switch (step) {
    case 'submitted':
      return 'filled';

    case 'inProcess':
      return status === MhaStatusEnum.InProgress ? 'outlined' : 'filled';

    case 'deadline':
      return status === MhaStatusEnum.Pending ||
        status === MhaStatusEnum.HrApproved ||
        status === MhaStatusEnum.BoardApproved
        ? 'filled'
        : 'outlined';

    case 'boardApproval':
      return status === MhaStatusEnum.HrApproved ||
        status === MhaStatusEnum.BoardApproved
        ? 'filled'
        : 'outlined';

    case 'available':
    default:
      return 'outlined';
  }
};
