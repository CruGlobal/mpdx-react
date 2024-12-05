import React, { useMemo } from 'react';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  DeleteButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { isEditableSource } from 'src/utils/sourceHelper';
import { useContactSourceQuery } from './ContactSource.generated';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

interface DeleteContactModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  deleting: boolean;
  deleteContact: () => void;
  contactId: string;
}

export const DeleteContactModal: React.FC<DeleteContactModalProps> = ({
  open,
  setOpen,
  deleting,
  deleteContact,
  contactId,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() ?? '';

  const { data } = useContactSourceQuery({
    variables: { accountListId, contactId },
    skip: !open && !contactId,
  });
  const contactSources = data?.contact;

  const canDelete = useMemo(() => {
    if (!contactSources) {
      return true;
    }
    // We ensure the contact was created on MPDX and that all the data is editable.
    // If any data is not editable, this means it was created by a third party.
    // Which will only recreate the data after deleting it on MPDX.
    // To prevent this confusion, we do not allow a contact to be deleted if it has non editable data.

    const isContactNonEditable = !isEditableSource(contactSources.source ?? '');

    const isAddressNonEditable = contactSources.addresses?.nodes.some(
      (address) => !isEditableSource(address.source ?? ''),
    );

    const hasNonEditablePersonData = contactSources.people?.nodes?.some(
      (people) => {
        const foundNonEditableEmailAddress = people.emailAddresses.nodes.some(
          (email) => !isEditableSource(email.source),
        );
        const foundNonEditablePhone = people.phoneNumbers.nodes.some(
          (phone) => !isEditableSource(phone.source),
        );
        return foundNonEditableEmailAddress || foundNonEditablePhone;
      },
    );

    const contactIsNotEditable =
      isContactNonEditable || isAddressNonEditable || hasNonEditablePersonData;

    return !contactIsNotEditable;
  }, [contactSources]);

  return (
    <Modal
      isOpen={open}
      title={t('Delete Contact')}
      handleClose={() => setOpen(false)}
    >
      <DialogContent dividers>
        <DialogContentText>
          {canDelete &&
            t(
              'Are you sure you want to permanently delete this contact? Doing so will permanently delete this contacts information, as well as task history. This cannot be undone. If you wish to keep this information, you can try hiding this contact instead.',
            )}
          {!canDelete &&
            t(
              "This contact cannot be deleted because part or all of the contact's data syncs with Donation Services. Please email Donation Services to request that this contact be deleted, or you can hide this contact instead.",
            )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <CancelButton
          size="large"
          disabled={deleting}
          onClick={() => setOpen(false)}
        />
        <DeleteButton
          size="large"
          variant="contained"
          disabled={deleting || !canDelete}
          onClick={deleteContact}
          sx={{ marginRight: 0 }}
        >
          {deleting && <LoadingIndicator size={20} />}
          {t('delete contact')}
        </DeleteButton>
      </DialogActions>
    </Modal>
  );
};
