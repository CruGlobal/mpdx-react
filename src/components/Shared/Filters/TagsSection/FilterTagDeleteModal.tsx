import { DialogActions, DialogContent, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { ContactFiltersDocument } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { TaskFiltersDocument } from 'pages/accountLists/[accountListId]/tasks/Tasks.generated';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useDeleteTagMutation } from './Chip/DeleteTag.generated';

interface FilterTagDeleteModalProps {
  tagName: string;
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

export const FilterTagDeleteModal: React.FC<FilterTagDeleteModalProps> = ({
  tagName,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { route } = useRouter();
  const [deleteTag] = useDeleteTagMutation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();

  const page = route.split('/')[3];

  const onDeleteTag = async () => {
    await deleteTag({
      variables: {
        tagName,
        page,
      },
      refetchQueries: [
        {
          query:
            page === 'contacts' ? ContactFiltersDocument : TaskFiltersDocument,
          variables: { accountListId },
        },
      ],
      onCompleted: () => {
        enqueueSnackbar(t('Tag deleted!'), {
          variant: 'success',
        });
      },
    });
    onClose(false);
  };

  return (
    <Modal
      title={t('Delete Tag?')}
      isOpen={isOpen}
      handleClose={() => onClose(false)}
    >
      <DialogContent>
        <Typography>
          {t(
            'Are you sure you want to completely delete this tag ({{tagName}}) and remove it from all tasks?',
            { tagName },
          )}
        </Typography>
        <Typography>
          {t('To remove a tag from selected tasks only, use the action menu.')}
        </Typography>
      </DialogContent>
      <DialogActions>
        <DeleteButton onClick={onDeleteTag}>Delete Tag</DeleteButton>
      </DialogActions>
    </Modal>
  );
};
