import React, { useMemo } from 'react';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from '../../../common/Modal/Modal';
import { UserOptionFragment } from '../FilterPanel.generated';
import { useDeleteUserOptionMutation } from './DeleteFilterModal.generated';

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
        const cacheId = cache.identify(filter);
        if (cacheId) {
          cache.evict({ id: cacheId });
          cache.gc();
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
