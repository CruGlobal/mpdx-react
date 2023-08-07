import React, { useMemo } from 'react';
import { useSnackbar } from 'notistack';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Modal from '../../../common/Modal/Modal';
import { UserOptionFragment } from '../FilterPanel.generated';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { useDeleteUserOptionMutation } from './DeleteFilterModal.generated';
import {
  GetUserOptionsDocument,
  GetUserOptionsQuery,
} from 'src/components/Contacts/ContactFlow/GetUserOptions.generated';

interface DeleteFilterModalProps {
  isOpen: boolean;
  handleClose: () => void;
  filter: UserOptionFragment;
}

export const DeleteFilterModal: React.FC<DeleteFilterModalProps> = ({
  isOpen,
  handleClose,
  filter,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteUserOption, { loading: saving }] = useDeleteUserOptionMutation();

  const handleDeleteFilter = async () => {
    await deleteUserOption({
      variables: {
        input: {
          id: filter.id,
        },
      },
      update: (cache) => {
        const query = {
          query: GetUserOptionsDocument,
        };
        const dataFromCache = cache.readQuery<GetUserOptionsQuery>(query);
        if (dataFromCache) {
          const filteredOutDeleted = dataFromCache.userOptions.filter(
            (option) => option.id !== filter.id,
          );

          cache.writeQuery({
            ...query,
            data: {
              userOptions: filteredOutDeleted,
            },
          });
        }

        enqueueSnackbar(t('Saved Filter Deleted!'), {
          variant: 'success',
        });
        handleClose();
      },
    });
  };

  const filterName = useMemo(
    () =>
      filter?.key
        ?.replace(/^(graphql_)?saved_(contacts|tasks|)_filter_/, '')
        .replaceAll('_', ' '),
    [filter],
  );

  return (
    <Modal
      isOpen={isOpen}
      title={t('Delete Saved filter')}
      handleClose={handleClose}
    >
      <DialogContent dividers>
        <Typography>
          {t(
            'Are you sure you wish to delete the saved filter {{filterName}}?',
            {
              filterName,
            },
          )}
        </Typography>
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose}>{t('No')}</CancelButton>
        <SubmitButton type="button" onClick={handleDeleteFilter}>
          {saving ? <CircularProgress color="secondary" size={20} /> : t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
