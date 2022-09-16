import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { styled } from '@mui/material/styles';
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
  const { openTaskModal } = useTaskModal();

  return (
    <Box display="flex" alignItems="center" px={5}>
      <LogTaskButton
        titleAccess={t('Log Task')}
        onClick={() =>
          openTaskModal({
            view: 'log',
            defaultValues: {
              contactIds: [contactId],
            },
          })
        }
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
