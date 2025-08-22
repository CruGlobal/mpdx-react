import React, { useMemo } from 'react';
import { Email, Person, Phone, Place } from '@mui/icons-material';
import {
  DialogActions,
  DialogContent,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LoadingIndicator } from 'src/components/Shared/styledComponents/styledComponents';
import {
  CancelButton,
  DeleteButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { isEditableSource, sourceToStr } from 'src/utils/sourceHelper';
import { useContactSourceQuery } from './ContactSource.generated';

interface CreateEmailLinkProps {
  partnerAccountNumbers: string[];
  contactName: string;
}
export const createEmailLink = ({
  partnerAccountNumbers,
  contactName,
}: CreateEmailLinkProps) => {
  return `mailto:${
    process.env.DONATION_SERVICES_EMAIL
  }?subject=Request+contact+deletion&body=${encodeURIComponent(
    'Dear Donation Services,\n\nPlease could you remove the following contact:' +
      `\n\nContact name: ${contactName}` +
      `\nContact's partner numbers: ${partnerAccountNumbers.join(', ')}` +
      '\n\nThanks,\n\n',
  )}`;
};

interface DataInfo {
  canDeleteWithoutIssues: boolean;
  contactSource: string;
  addressSources: string[];
  emailSources: string[];
  phoneSources: string[];
  emailLink: string;
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
  const contact = data?.contact;

  const dataInfo: DataInfo = useMemo(() => {
    if (!contact) {
      return {
        canDeleteWithoutIssues: true,
        contactSource: sourceToStr(t, 'MPDX'),
        addressSources: [],
        emailSources: [],
        phoneSources: [],
        emailLink: '',
      };
    }

    // We ensure the contact was created on MPDX and that all the data is editable.
    // If any data is not editable, this means it was created by a third party.
    // Which will only recreate the data after deleting it on MPDX.
    // To prevent this confusion, we do not allow a contact to be deleted if it has non editable data.

    const addressSources = new Set<string>();
    const emailSources = new Set<string>();
    const phoneSources = new Set<string>();

    contact.addresses?.nodes.forEach((address) => {
      if (!isEditableSource(address.source)) {
        addressSources.add(address.source);
      }
    });

    contact.people?.nodes.forEach((person) => {
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
    const partnerAccountNumbers = contact.contactDonorAccounts.nodes.map(
      ({ donorAccount }) => donorAccount.accountNumber,
    );

    return {
      canDeleteWithoutIssues:
        isEditableSource(contact.source ?? undefined) &&
        !addressSources.size &&
        !emailSources.size &&
        !phoneSources.size,
      contactSource: sourceToStr(t, contact.source),
      addressSources: [...addressSources].map((source) =>
        sourceToStr(t, source),
      ),
      emailSources: [...emailSources].map((source) => sourceToStr(t, source)),
      phoneSources: [...phoneSources].map((source) => sourceToStr(t, source)),
      emailLink: createEmailLink({
        partnerAccountNumbers,
        contactName: contact.name,
      }),
    };
  }, [contact]);

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
                `For contacts originating from Donation Services or DonorHub, `,
              )}
              <Link
                href={dataInfo.emailLink}
                target="_blank"
                sx={{ fontWeight: 'bold' }}
              >
                {t('email Donation Services to request deletion.')}
              </Link>
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
