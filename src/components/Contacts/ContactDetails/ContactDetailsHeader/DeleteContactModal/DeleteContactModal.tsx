import React, { useMemo } from 'react';
import { Email, Person, Phone, Place } from '@mui/icons-material';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  DeleteButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { isEditableSource, sourceToStr } from 'src/utils/sourceHelper';
import { useContactSourceQuery } from './ContactSource.generated';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

interface DataInfo {
  canDelete: boolean;
  uniqueSources: {
    contact: string[];
    address: string[];
    email: string[];
    phone: string[];
  };
}
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

  const dataInfo: DataInfo = useMemo(() => {
    if (!contactSources) {
      return {
        canDelete: true,
        uniqueSources: {
          contact: [],
          address: [],
          email: [],
          phone: [],
        },
      };
    }
    // We ensure the contact was created on MPDX and that all the data is editable.
    // If any data is not editable, this means it was created by a third party.
    // Which will only recreate the data after deleting it on MPDX.
    // To prevent this confusion, we do not allow a contact to be deleted if it has non editable data.

    const isContactNonEditable = !isEditableSource(contactSources.source ?? '');

    const sources: Map<string, string[]> = new Map();
    sources.set('contact', [contactSources.source ?? '']);

    const isAddressNonEditable = contactSources.addresses?.nodes.reduce(
      (acc, address) => {
        sources.set('address', [
          ...(sources.get('address') ?? []),
          address.source,
        ]);
        return acc || !isEditableSource(address.source ?? '');
      },
      false,
    );

    const hasNonEditablePersonData = contactSources.people?.nodes?.reduce(
      (acc, person) => {
        const foundNonEditableEmailAddress = person.emailAddresses.nodes.reduce(
          (emailAcc, email) => {
            sources.set('email', [
              ...(sources.get('email') ?? []),
              email.source,
            ]);
            return emailAcc || !isEditableSource(email.source);
          },
          false,
        );
        const foundNonEditablePhone = person.phoneNumbers.nodes.reduce(
          (phoneAcc, phone) => {
            sources.set('phone', [
              ...(sources.get('phone') ?? []),
              phone.source,
            ]);
            return phoneAcc || !isEditableSource(phone.source);
          },
          false,
        );
        return acc || foundNonEditableEmailAddress || foundNonEditablePhone;
      },
      false,
    );

    const uniqueSources: DataInfo['uniqueSources'] = {
      contact: [],
      address: [],
      email: [],
      phone: [],
      ...Object.fromEntries(
        Array.from(sources, ([dataType, ArrOfSources]) => [
          dataType,
          [...new Set(ArrOfSources)].map((source) => sourceToStr(t, source)),
        ]),
      ),
    };

    const contactIsNotEditable =
      isContactNonEditable || isAddressNonEditable || hasNonEditablePersonData;

    return {
      canDelete: !contactIsNotEditable,
      uniqueSources,
    };
  }, [contactSources]);

  return (
    <Modal
      isOpen={open}
      title={t('Delete Contact')}
      handleClose={() => setOpen(false)}
    >
      <DialogContent dividers>
        {dataInfo.canDelete ? (
          <Typography>
            {t(
              `Are you sure you want to permanently delete this contact? Doing so will permanently delete this contacts information, as well as task history. This cannot be undone. If you wish to keep this information, you can try hiding this contact instead.`,
            )}
          </Typography>
        ) : (
          <>
            <Typography>
              {t(
                `Be cautious when deleting this contact, as its data may sync with Donation Services or other third-party systems. Deleting the contact will not remove it from those systems; consider hiding the contact instead.`,
              )}
            </Typography>
            <Typography fontWeight="bold">
              {t(
                `For contacts originating from Siebel or Donor Hub, email Donation Services to request deletion.`,
              )}
            </Typography>
            <br />
            <br />
            <Typography variant="h6">{t('Data sources:')}</Typography>
            <List dense={true}>
              {!!dataInfo.uniqueSources.contact.length && (
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${t(
                      'Contact: ',
                    )} ${dataInfo.uniqueSources.contact.join(', ')}`}
                  />
                </ListItem>
              )}

              {!!dataInfo.uniqueSources.address.length && (
                <ListItem>
                  <ListItemIcon>
                    <Place />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${t(
                      'Address: ',
                    )} ${dataInfo.uniqueSources.address.join(', ')}`}
                  />
                </ListItem>
              )}
              {!!dataInfo.uniqueSources.email.length && (
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${t(
                      'Email: ',
                    )} ${dataInfo.uniqueSources.email.join(', ')}`}
                  />
                </ListItem>
              )}
              {!!dataInfo.uniqueSources.phone.length && (
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${t(
                      'Phone: ',
                    )} ${dataInfo.uniqueSources.phone.join(', ')}`}
                  />
                </ListItem>
              )}
            </List>
          </>
        )}
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
          disabled={deleting}
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
