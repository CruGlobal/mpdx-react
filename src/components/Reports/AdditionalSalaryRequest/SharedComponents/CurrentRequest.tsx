import { AttachMoney } from '@mui/icons-material';
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
import { getDotColor } from '../Shared/Helper/getDotColor';
import { getDotVariant } from '../Shared/Helper/getDotVariant';
import { getRequestUrl } from '../Shared/Helper/getRequestUrl';

interface CurrentRequestProps {
  request: AdditionalSalaryRequestsQuery['additionalSalaryRequests']['nodes'][0];
}

export const CurrentRequest: React.FC<CurrentRequestProps> = ({ request }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();
  const { preferredName, handleDeleteRequest } = useAdditionalSalaryRequest();

  const { id, status, totalAdditionalSalaryRequested } = request;

  // TODO remove submittedDate and processedDate placeholders and grab from request once available
  const submittedDate = new Date().toISOString();
  const processedDate = new Date().toISOString();

  return (
    <StatusCard
      formType={t('ASR Request')}
      title={t("{{preferredName}}'s Pending Additional Salary Request", {
        preferredName,
      })}
      icon={AttachMoney}
      iconColor="warning.main"
      linkOneText={t('View Request')}
      linkOne={getRequestUrl(accountListId, id, 'view')}
      linkTwoText={t('Edit Request')}
      linkTwo={getRequestUrl(accountListId, id, 'edit')}
      isRequest={true}
      handleConfirmCancel={() => handleDeleteRequest(id)}
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
                  {t('In Progress')}
                </Typography>
              ) : (
                <Typography>
                  <Box component="span" sx={{ fontWeight: 'bold' }}>
                    {t('Requested on:')}
                  </Box>
                  {submittedDate &&
                    ` ${dateFormat(DateTime.fromISO(submittedDate), locale)}`}
                </Typography>
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
                <Typography>
                  <Box component="span" sx={{ fontWeight: 'bold' }}>
                    {t('Request processed on:')}
                  </Box>
                  {processedDate &&
                    ` ${dateFormat(DateTime.fromISO(processedDate), locale)}`}
                </Typography>
              ) : (
                <Typography sx={{ fontWeight: 'bold' }}>
                  {t('Request In Process')}
                </Typography>
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
