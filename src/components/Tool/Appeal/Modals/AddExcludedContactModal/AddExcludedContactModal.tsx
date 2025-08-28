import React, { useContext } from 'react';
import {
  Box,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { LoadingIndicator } from 'src/components/Shared/styledComponents/LoadingStyling';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { useAssignContactsToAppealMutation } from '../AddContactToAppealModal/AddContactToAppeal.generated';
import { useAppealContactsQuery } from '../AddContactToAppealModal/AppealContacts.generated';

export interface AddExcludedContactModalProps {
  contactIds: string[];
  handleClose: () => void;
}

export const AddExcludedContactModal: React.FC<
  AddExcludedContactModalProps
> = ({ contactIds, handleClose }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [assignContactsToAppeal, { loading: mutating }] =
    useAssignContactsToAppealMutation();
  const { accountListId, appealId } = useContext(AppealsContext) as AppealsType;

  const { data, loading } = useAppealContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      appealId: appealId ?? '',
    },
  });

  const existingContactIds = data?.appeal?.contactIds ?? [];
  const addingManyContacts = contactIds.length > 1;

  const handleConfirm = async () => {
    if (!contactIds.length) {
      enqueueSnackbar(t('Failed to add contact(s) to appeal'), {
        variant: 'error',
      });
      return;
    }
    await assignContactsToAppeal({
      variables: {
        input: {
          accountListId: accountListId ?? '',
          attributes: {
            id: appealId,
            contactIds: [...existingContactIds, ...contactIds],
            forceListDeletion: true,
          },
        },
      },
      refetchQueries: ['Contacts'],
      onCompleted: () => {
        enqueueSnackbar(
          addingManyContacts
            ? t('Successfully added contacts to appeal')
            : t('Successfully added contact to appeal'),
          {
            variant: 'success',
          },
        );
        handleClose();
      },
      onError: () => {
        enqueueSnackbar(
          addingManyContacts
            ? t('Failed to add contacts to appeal')
            : t('Failed to add contact to appeal'),
          {
            variant: 'error',
          },
        );
      },
    });
  };

  const title = addingManyContacts ? t('Add Contacts') : t('Add Contact');
  const text = addingManyContacts
    ? t(
        'You will not be able to exclude these {{number}} contacts once you add them to this appeal. Instead, you will be able to remove them from it. Are you sure?',
        { number: contactIds.length },
      )
    : t(
        'You will not be able to exclude this contact once you add them to this appeal. Instead, you will be able to remove them from it. Are you sure?',
      );

  return (
    <Modal isOpen={true} title={title} handleClose={handleClose}>
      <DialogContent dividers data-testid="AddExcludedContactModal">
        {mutating ? (
          <Box style={{ textAlign: 'center' }}>
            <LoadingIndicator color="primary" size={50} />
          </Box>
        ) : (
          <DialogContentText component="div">{text}</DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose} disabled={mutating || loading}>
          {t('No')}
        </CancelButton>
        <SubmitButton
          type="button"
          onClick={handleConfirm}
          disabled={mutating || loading}
        >
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
