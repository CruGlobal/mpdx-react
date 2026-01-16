import React from 'react';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@mui/lab';
import { Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SalaryRequestStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import type { LandingSalaryCalculationsQuery } from '../../NewSalaryCalculationLanding/LandingSalaryCalculations.generated';

const StyledTimelineItem = styled(TimelineItem)({
  '&::before': {
    content: 'none',
  },
});

const StyledTimelineContent = styled(TimelineContent)({
  paddingTop: theme.spacing(0.4),
});

const getStatusColor = (status: SalaryRequestStatusEnum | string) => {
  switch (status) {
    case SalaryRequestStatusEnum.Approved:
      return 'success';
    case SalaryRequestStatusEnum.ActionRequired:
      return 'warning';
    default:
      return 'grey';
  }
};

interface PendingRequestTimelineProps {
  calculation: LandingSalaryCalculationsQuery['latestCalculation'];
  requestedOn: string;
  processedOn: string;
  feedback: string | null;
}

export const PendingRequestTimeline: React.FC<PendingRequestTimelineProps> = ({
  calculation,
  requestedOn,
  processedOn,
  feedback,
}) => {
  const { t } = useTranslation();

  const isComplete =
    calculation?.status === SalaryRequestStatusEnum.ActionRequired;

  return (
    <Timeline
      position="right"
      sx={{
        padding: 0,
        margin: 0,
      }}
    >
      <StyledTimelineItem>
        <TimelineSeparator>
          <TimelineDot color="success" />
          <TimelineConnector />
        </TimelineSeparator>
        <StyledTimelineContent>
          <Typography variant="subtitle1" fontWeight="bold">
            {t('Requested on')}: {requestedOn}
          </Typography>
        </StyledTimelineContent>
      </StyledTimelineItem>

      <StyledTimelineItem>
        <TimelineSeparator>
          <TimelineDot color={isComplete ? 'success' : 'primary'} />
          <TimelineConnector />
        </TimelineSeparator>
        <StyledTimelineContent>
          {isComplete ? (
            <Typography variant="subtitle1" fontWeight="bold">
              {t('Request processed on')}: {processedOn}
            </Typography>
          ) : (
            <Typography variant="subtitle1" fontWeight="bold">
              {t('Request in process')}
            </Typography>
          )}
        </StyledTimelineContent>
      </StyledTimelineItem>

      <StyledTimelineItem>
        <TimelineSeparator>
          <TimelineDot
            color={calculation ? getStatusColor(calculation.status) : 'grey'}
            variant={isComplete ? 'filled' : 'outlined'}
          />
        </TimelineSeparator>
        <StyledTimelineContent>
          {isComplete ? (
            <>
              <Typography variant="subtitle1" fontWeight="bold">
                {t('Action Required')}: {t('Approver Inquiry')}
              </Typography>
              {feedback && <Typography variant="body2">{feedback}</Typography>}
            </>
          ) : (
            <Typography variant="subtitle1">{t('Request complete')}</Typography>
          )}
        </StyledTimelineContent>
      </StyledTimelineItem>
    </Timeline>
  );
};
