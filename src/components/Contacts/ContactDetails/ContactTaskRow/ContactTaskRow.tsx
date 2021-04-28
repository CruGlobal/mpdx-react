import { Box, styled, Typography } from '@material-ui/core';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityTypeEnum } from '../../../../../graphql/types.generated';
import { ContactCheckBox } from '../../ContactCheckBox/ContactCheckBox';
import { ContactTaskRowFragment } from './ContactTaskRow.generated';
import { TaskCompleteButton } from './TaskCompleteButton/TaskCompleteButton';

const TaskRowWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  margin: theme.spacing(1),
}));

const TaskType = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

const TaskDescription = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.primary,
  marginLeft: theme.spacing(0.5),
}));

const getLocalizedTaskType = (
  t: TFunction,
  taskType: ActivityTypeEnum | null | undefined,
): string => {
  if (!taskType) {
    return '';
  }

  switch (taskType) {
    case ActivityTypeEnum.Appointment:
      return t('Appointment');

    case ActivityTypeEnum.Call:
      return t('Call');

    case ActivityTypeEnum.Email:
      return t('Email');

    case ActivityTypeEnum.FacebookMessage:
      return t('Facebook Message');

    case ActivityTypeEnum.Letter:
      return t('Letter');

    case ActivityTypeEnum.NewsletterEmail:
      return t('Newsletter - Email');

    case ActivityTypeEnum.NewsletterPhysical:
      return t('Newsletter - Physical');

    case ActivityTypeEnum.None:
      return '';

    case ActivityTypeEnum.PrayerRequest:
      return t('Prayer Request');

    case ActivityTypeEnum.PreCallLetter:
      return t('Pre-Call Letter');

    case ActivityTypeEnum.ReminderLetter:
      return t('Reminder Letter');

    case ActivityTypeEnum.SupportLetter:
      return t('Support Letter');

    case ActivityTypeEnum.TalkToInPerson:
      return t('Talk To In Person');

    case ActivityTypeEnum.TextMessage:
      return t('Text Message');

    case ActivityTypeEnum.Thank:
      return t('Thank');

    case ActivityTypeEnum.ToDo:
      return t('To Do');
  }
};

interface ContactTaskRowProps {
  task: ContactTaskRowFragment;
}

export const ContactTaskRow: React.FC<ContactTaskRowProps> = ({ task }) => {
  const { t } = useTranslation();

  const handleContactCheckPressed = () => {
    //select contact for actions
  };

  const handleCompleteButtonPressed = () => {
    //trigger complete task flow
  };

  return (
    <TaskRowWrap>
      <ContactCheckBox />
      <TaskCompleteButton
        isComplete={false}
        onClick={handleCompleteButtonPressed}
      />
      <TaskType>{getLocalizedTaskType(t, task.activityType)}</TaskType>
      <TaskDescription>{task.subject}</TaskDescription>
    </TaskRowWrap>
  );
};
