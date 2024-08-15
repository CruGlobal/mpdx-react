import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import {
  AppealContactsInfoFragment,
  useAppealContactsQuery,
  useDeleteAppealContactMutation,
} from './DeleteAppealContact.generated';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

export interface DeleteAppealContactModalProps {
  contactId: string;
  handleClose: () => void;
}

export const DeleteAppealContactModal: React.FC<
  DeleteAppealContactModalProps
> = ({ contactId, handleClose }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { appealId } = React.useContext(AppealsContext) as AppealsType;
  const [deleteAppealContact] = useDeleteAppealContactMutation();
  const { data, fetchMore } = useAppealContactsQuery({
    variables: {
      appealId: appealId ?? '',
    },
  });
  const [mutating, setMutating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appealContactsIds, setAppealContactsIds] = useState<
    AppealContactsInfoFragment[]
  >([]);

  const loadAllAppealContacts = async () => {
    let allContacts = data?.appealContacts.nodes ?? [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const response = await fetchMore({
        variables: {
          appealId: appealId,
          after: cursor,
          first: 100,
        },
      });

      const newContacts = response.data.appealContacts.nodes;
      allContacts = [...allContacts, ...newContacts];
      hasNextPage = response.data.appealContacts.pageInfo.hasNextPage;
      cursor = response.data.appealContacts.pageInfo.endCursor ?? null;
    }

    setAppealContactsIds(allContacts);
    setLoading(false);
    return allContacts;
  };

  React.useEffect(() => {
    loadAllAppealContacts();
  }, []);

  const handleRemoveContact = async () => {
    const appealContactId = appealContactsIds.find(
      (appealContact) => appealContact.contact.id === contactId,
    )?.id;
    if (!appealContactId) {
      enqueueSnackbar('Error while removing contact from appeal.', {
        variant: 'error',
      });
      return;
    }
    await deleteAppealContact({
      variables: {
        input: {
          id: appealContactId,
        },
      },
      update: (cache) => {
        cache.evict({ id: `Contact:${contactId}` });
      },
      onCompleted: () => {
        enqueueSnackbar('Successfully remove contact from appeal.', {
          variant: 'success',
        });
        handleClose();
      },
      onError: () => {
        enqueueSnackbar('Error while removing contact from appeal.', {
          variant: 'error',
        });
      },
    });
    setMutating(false);
  };

  const onClickDecline = () => {
    handleClose();
  };

  return (
    <Modal isOpen={true} title={t('Remove Contact')} handleClose={handleClose}>
      <DialogContent dividers>
        {mutating ? (
          <Box style={{ textAlign: 'center' }}>
            <LoadingIndicator color="primary" size={50} />
          </Box>
        ) : (
          <DialogContentText component="div">
            {t('Are you sure you wish to remove this contact from the appeal?')}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={onClickDecline} disabled={mutating || loading}>
          {t('No')}
        </CancelButton>
        <SubmitButton
          type="button"
          onClick={handleRemoveContact}
          disabled={mutating || loading}
        >
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
