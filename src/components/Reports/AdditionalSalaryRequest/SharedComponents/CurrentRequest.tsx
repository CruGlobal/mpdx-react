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
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import { PageEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { StatusCard } from '../../Shared/CalculationReports/StatusCard/StatusCard';
import { AdditionalSalaryRequestQuery } from '../AdditionalSalaryRequest.generated';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { getDotColor } from '../Shared/Helper/getDotColor';
import { getDotVariant } from '../Shared/Helper/getDotVariant';

interface CurrentRequestProps {
  request: NonNullable<
    AdditionalSalaryRequestQuery['latestAdditionalSalaryRequest']
  >;
}

export const CurrentRequest: React.FC<CurrentRequestProps> = ({ request }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { user, handleDeleteRequest, setPageType, goToStep } =
    useAdditionalSalaryRequest();
  const preferredName = user?.staffInfo?.preferredName;

  const { id, status, totalAdditionalSalaryRequested, submittedAt } = request;

  // TODO remove submittedAt and processedDate placeholders and grab from request once available
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
      handleLinkOne={() => setPageType(PageEnum.View)}
      hideLinkTwoButton={status !== AsrStatusEnum.ActionRequired}
      linkTwoText={t('Edit Request')}
      handleLinkTwo={() => {
        setPageType(PageEnum.Edit);
        goToStep(1);
      }}
      isRequest={true}
      handleConfirmCancel={() => handleDeleteRequest(id, true)}
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
                  {submittedAt &&
                    ` ${dateFormat(DateTime.fromISO(submittedAt), locale)}`}
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
