import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface ContactUncompletedTasksCountProps {
  uncompletedTasksCount: number;
}

export const ContactUncompletedTasksCount: React.FC<
  ContactUncompletedTasksCountProps
> = ({ uncompletedTasksCount }) => {
  const { t } = useTranslation();

  return (
    <Box display="flex" alignItems="center" px={5}>
      <CheckCircleOutlineIcon
        color="disabled"
        titleAccess={t('Check Outlined')}
      />
      <Box ml={2}>
        <Typography color="textSecondary">{uncompletedTasksCount}</Typography>
      </Box>
    </Box>
  );
};
