import React, { useMemo } from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
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

  const handleLogTaskClick = useMemo(
    () => (e) => {
      // eslint-disable-next-line no-console
      e.preventDefault();
      openTaskModal({
        view: 'log',
        defaultValues: {
          contactIds: [contactId],
        },
      });
    },
    [contactId],
  );

  return (
    <Box display="flex" alignItems="center" px={5}>
      <LogTaskButton titleAccess={t('Log Task')} onClick={handleLogTaskClick} />
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
