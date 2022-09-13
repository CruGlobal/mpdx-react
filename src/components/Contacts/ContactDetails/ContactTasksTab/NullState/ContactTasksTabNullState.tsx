import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import { mdiFormatListBulleted } from '@mdi/js';
import { Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { NullStateBox } from 'src/components/Shared/Filters/NullState/NullStateBox';
import useTaskModal from 'src/hooks/useTaskModal';

const AddTaskButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  color: theme.palette.common.white,
  backgroundColor: theme.palette.mpdxBlue.main,
  '&:hover': {
    backgroundColor: theme.palette.mpdxBlue.main,
  },
}));

interface ContactTasksTabNullStateProps {
  contactId: string;
}

export const ContactTasksTabNullState: React.FC<
  ContactTasksTabNullStateProps
> = ({ contactId }) => {
  const { t } = useTranslation();
  const { openTaskModal } = useTaskModal();

  return (
    <NullStateBox>
      <Icon path={mdiFormatListBulleted} size={1.5} />
      <Typography variant="h5">
        {t('No tasks can be found for this contact')}
      </Typography>
      <Typography>
        {t('Try adding a task or changing your search filters.')}
      </Typography>
      <AddTaskButton
        variant="contained"
        onClick={() =>
          openTaskModal({ defaultValues: { contactIds: [contactId] } })
        }
      >
        {t('Add New Task')}
      </AddTaskButton>
    </NullStateBox>
  );
};
