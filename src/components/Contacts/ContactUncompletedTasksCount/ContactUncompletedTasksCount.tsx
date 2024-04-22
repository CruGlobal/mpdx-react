import React from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import useTaskModal from 'src/hooks/useTaskModal';

interface ContactUncompletedTasksCountProps {
  uncompletedTasksCount: number;
  contactId: string;
}

const LogTaskButton = styled(CheckCircleOutlineIcon)(({ theme }) => ({
  color: theme.palette.cruGrayMedium.main,
  '&:hover': {
    color: theme.palette.cruGrayDark.main,
  },
}));

export const ContactUncompletedTasksCount: React.FC<
  ContactUncompletedTasksCountProps
> = ({ uncompletedTasksCount, contactId }) => {
  const { t } = useTranslation();
  const { openTaskModal, preloadTaskModal } = useTaskModal();

  return (
    <Box display="flex" alignItems="center" px={5}>
      <LogTaskButton
        titleAccess={t('Log Task')}
        onClick={() =>
          openTaskModal({
            view: TaskModalEnum.Log,
            defaultValues: {
              contactIds: [contactId],
            },
          })
        }
        onMouseEnter={() => preloadTaskModal(TaskModalEnum.Log)}
      />
      <Box ml={2}>
        <Typography
          color="textSecondary"
          style={{
            visibility: uncompletedTasksCount > 0 ? 'visible' : 'hidden',
          }}
        >
          {uncompletedTasksCount}
        </Typography>
      </Box>
    </Box>
  );
};
