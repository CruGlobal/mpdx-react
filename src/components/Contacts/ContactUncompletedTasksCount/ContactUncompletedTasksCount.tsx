import React from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import useTaskModal from 'src/hooks/useTaskModal';

interface ContactUncompletedTasksCountProps {
  uncompletedTasksCount: number;
  contactId: string;
}

const LogTaskIcon = styled(CheckCircleOutlineIcon)(({ theme }) => ({
  color: theme.palette.mpdxGrayMedium.main,
  '&:hover': {
    color: theme.palette.mpdxGrayDark.main,
  },
}));

export const ContactUncompletedTasksCount: React.FC<
  ContactUncompletedTasksCountProps
> = ({ uncompletedTasksCount, contactId }) => {
  const { t } = useTranslation();
  const { openTaskModal, preloadTaskModal } = useTaskModal();

  return (
    <Box display="flex" alignItems="center" px={5}>
      <IconButton
        aria-label={t('Log Task')}
        onClick={() =>
          openTaskModal({
            view: TaskModalEnum.Log,
            defaultValues: {
              contactIds: [contactId],
            },
          })
        }
        onMouseEnter={() => preloadTaskModal(TaskModalEnum.Log)}
      >
        <LogTaskIcon />
      </IconButton>
      <Typography
        color="textSecondary"
        style={{
          visibility: uncompletedTasksCount > 0 ? 'visible' : 'hidden',
        }}
      >
        {uncompletedTasksCount}
      </Typography>
    </Box>
  );
};
