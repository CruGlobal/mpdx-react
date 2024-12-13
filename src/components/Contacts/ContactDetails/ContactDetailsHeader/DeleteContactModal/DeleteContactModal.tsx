import React, { useMemo } from 'react';
import { Email, Person, Phone, Place } from '@mui/icons-material';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  Link,
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
  canDeleteWithoutIssues: boolean;
  contactSource: string;
  addressSources: string[];
  emailSources: string[];
  phoneSources: string[];
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
  const contactName = data?.contact?.name;

  const dataInfo: DataInfo = useMemo(() => {
    if (!contactSources) {
      return {
        canDeleteWithoutIssues: true,
        contactSource: sourceToStr(t, 'MPDX'),
        addressSources: [],
        emailSources: [],
        phoneSources: [],
      };
    }

    // We ensure the contact was created on MPDX and that all the data is editable.
    // If any data is not editable, this means it was created by a third party.
    // Which will only recreate the data after deleting it on MPDX.
    // To prevent this confusion, we do not allow a contact to be deleted if it has non editable data.

    const addressSources = new Set<string>();
    const emailSources = new Set<string>();
    const phoneSources = new Set<string>();

    contactSources.addresses?.nodes.forEach((address) => {
      if (!isEditableSource(address.source)) {
        addressSources.add(address.source);
      }
    });

    contactSources.people?.nodes.forEach((person) => {
      person.emailAddresses.nodes.forEach((email) => {
        if (!isEditableSource(email.source)) {
          emailSources.add(email.source);
        }
      });
      person.phoneNumbers.nodes.forEach((phone) => {
        if (!isEditableSource(phone.source)) {
          phoneSources.add(phone.source);
        }
      });
    });

    return {
      canDeleteWithoutIssues:
        isEditableSource(contactSources.source ?? undefined) &&
        !addressSources.size &&
        !emailSources.size &&
        !phoneSources.size,
      contactSource: sourceToStr(t, contactSources.source),
      addressSources: [...addressSources].map((source) =>
        sourceToStr(t, source),
      ),
      emailSources: [...emailSources].map((source) => sourceToStr(t, source)),
      phoneSources: [...phoneSources].map((source) => sourceToStr(t, source)),
    };
  }, [contactSources]);

  return (
    <Modal
      isOpen={open}
      title={t('Delete Contact')}
      handleClose={() => setOpen(false)}
    >
      <DialogContent dividers>
        {dataInfo.canDeleteWithoutIssues ? (
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
                `For contacts originating from Donation Services or DonorHub, email Donation Services to request deletion.`,
              )}
            </Typography>
            <br />
            <Typography variant="h6">{t('Data sources:')}</Typography>
            <List dense={true}>
              {!!dataInfo.contactSource && (
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${t('Contact: ')} ${dataInfo.contactSource}`}
                  />
                </ListItem>
              )}

              {!!dataInfo.addressSources.length && (
                <ListItem>
                  <ListItemIcon>
                    <Place />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${t('Address: ')} ${dataInfo.addressSources.join(
                      ', ',
                    )}`}
                  />
                </ListItem>
              )}
              {!!dataInfo.emailSources.length && (
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${t('Email: ')} ${dataInfo.emailSources.join(
                      ', ',
                    )}`}
                  />
                </ListItem>
              )}
              {!!dataInfo.phoneSources.length && (
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${t('Phone: ')} ${dataInfo.phoneSources.join(
                      ', ',
                    )}`}
                  />
                </ListItem>
              )}
            </List>
            <br />
            <Typography>
              <Link
                href={`mailto:${
                  process.env.DONATION_SERVICES_EMAIL
                }?subject=Request+contact+deletion&body=${encodeURIComponent(
                  `Dear Donation Services,\n\Please could you remove the following contact: ${contactName} ` +
                    '\n\nThanks,\n\n',
                )}`}
                underline="hover"
                sx={{ fontWeight: 'bold' }}
              >
                {t('Email Donation Services here')}
              </Link>
            </Typography>
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
