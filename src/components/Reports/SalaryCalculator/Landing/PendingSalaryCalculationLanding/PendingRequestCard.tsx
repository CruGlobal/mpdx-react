import React from 'react';
import { Delete, Download, PriceCheckSharp } from '@mui/icons-material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@mui/lab';
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';

const StyledTimelineItem = styled(TimelineItem)({
  '&::before': {
    content: 'none',
  },
});

export const PendingRequestCard: React.FC = () => {
  const { t } = useTranslation();
  const { calculation } = useSalaryCalculator();

  const requestDate = calculation?.effectiveDate
    ? new Date(calculation.effectiveDate).toLocaleDateString()
    : t('N/A');

  return (
    <Card sx={{ marginBlock: theme.spacing(3) }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'orange' }}>
            <PriceCheckSharp />
          </Avatar>
        }
        title={t('Pending Salary Calculation Form')}
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <IconButton aria-label={t('Download')}>
            <Download />
          </IconButton>
        }
      />
      <CardContent>
        <Timeline
          position="right"
          sx={{
            padding: theme.spacing(0),
            margin: theme.spacing(0),
          }}
        >
          <StyledTimelineItem>
            <TimelineSeparator>
              <TimelineDot color="success" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle1" fontWeight="bold">
                {t('Requested on')}: {requestDate}
              </Typography>
            </TimelineContent>
          </StyledTimelineItem>

          <StyledTimelineItem>
            <TimelineSeparator>
              <TimelineDot color="primary" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle1" fontWeight="bold">
                {t('Request in process')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('Your request is being reviewed')}
              </Typography>
            </TimelineContent>
          </StyledTimelineItem>

          <StyledTimelineItem>
            <TimelineSeparator>
              <TimelineDot color="grey" />
            </TimelineSeparator>
            <TimelineContent>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="text.secondary"
              >
                {t('Request complete')}
              </Typography>
            </TimelineContent>
          </StyledTimelineItem>
        </Timeline>
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'space-between',
          paddingInline: theme.spacing(2),
          paddingBottom: theme.spacing(2),
        }}
      >
        <Button variant="contained">{t('View Request')}</Button>
        <IconButton aria-label={t('Delete')} color="error">
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  );
};
