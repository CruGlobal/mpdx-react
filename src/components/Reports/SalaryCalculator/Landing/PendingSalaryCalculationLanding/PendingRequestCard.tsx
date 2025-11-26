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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';

export const PendingRequestCard: React.FC = () => {
  const { t } = useTranslation();
  const { calculation } = useSalaryCalculator();

  const requestDate = calculation?.effectiveDate
    ? new Date(calculation.effectiveDate).toLocaleDateString()
    : t('N/A');

  return (
    <Card sx={{ my: 3 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'orange' }}>
            <PriceCheckSharp />
          </Avatar>
        }
        title={
          <Typography variant="h6">
            {t('Pending Salary Calculation Form')}
          </Typography>
        }
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
            padding: 0,
            margin: 0,
          }}
        >
          <TimelineItem
            sx={{
              '&::before': {
                content: 'none',
              },
            }}
          >
            <TimelineSeparator>
              <TimelineDot color="success" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle1" fontWeight="bold">
                {t('Requested on')}: {requestDate}
              </Typography>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem
            sx={{
              '&::before': {
                content: 'none',
              },
            }}
          >
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
          </TimelineItem>

          <TimelineItem
            sx={{
              '&::before': {
                content: 'none',
              },
            }}
          >
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
          </TimelineItem>
        </Timeline>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button variant="contained">{t('View Request')}</Button>
        <IconButton aria-label={t('Delete')} color="error">
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  );
};
