import React, { useMemo, useState } from 'react';
import { Delete, Lock } from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  Hidden,
  Link,
  ListItemText,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import {
  ContactPeople,
  ContactPeopleAccountListsUsers,
  OrganizationsContact,
} from 'src/graphql/types.generated';
import {
  useAnonymizeContactMutation,
  useDeleteOrganizationContactMutation,
} from '../Contact.generated';

const styles = {
  buttonIcon: {
    marginRight: '7px',
  },
};

interface Props {
  contact: OrganizationsContact;
  selectedOrganizationName: string;
}
interface PersonDataProps {
  person: ContactPeople | ContactPeopleAccountListsUsers;
}

const StyledBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  justifyContent: 'flex-start',
}));

const PersonData: React.FC<PersonDataProps> = ({ person }) => {
  const email =
    person?.emailAddresses &&
    person?.emailAddresses.find((email) => email?.primary);
  const phone =
    person?.phoneNumbers &&
    person?.phoneNumbers.find((phone) => phone?.primary);
  return (
    <StyledBox>
      <Typography component="span" variant="body2">
        {person?.firstName} {person?.lastName}
      </Typography>
      {email && (
        <Link
          underline="hover"
          key={`email-${email.email}`}
          href={`mailto:${email.email}`}
        >
          {email.email}
        </Link>
      )}
      {phone && (
        <Typography
          key={`phone-${phone.number}`}
          component="span"
          variant="body2"
        >
          {phone.number}
        </Typography>
      )}
    </StyledBox>
  );
};

export const ContactRow: React.FC<Props> = ({
  contact,
  selectedOrganizationName,
}) => {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anonymizeDialogOpen, setAnonymizeDialogOpen] = useState(false);
  const [deleteOrganizationContact] = useDeleteOrganizationContactMutation();
  const [anonymizeContact] = useAnonymizeContactMutation();
  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteContact = async () => {
    await deleteOrganizationContact({
      variables: {
        input: {
          contactId: contact.id,
        },
      },
      update: (cache) => {
        cache.evict({ id: `OrganizationsContact:${contact.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(t('Contact successfully deleted'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t('Error while trying to delete contact'), {
          variant: 'error',
        });
      },
    });
  };
  const handleAnonymizeContact = async () => {
    await anonymizeContact({
      variables: {
        input: {
          contactId: contact.id,
        },
      },
      update: (cache) => {
        cache.evict({ id: `OrganizationsContact:${contact.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(t('Contact successfully anonymized'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t('Error while trying to anonymize contact'), {
          variant: 'error',
        });
      },
    });
  };

  const { name, people, addresses, accountList, allowDeletion } = contact;

  const primaryAddress = useMemo(
    () =>
      addresses?.find((address) => address?.primaryMailingAddress) || addresses
        ? addresses[0]
        : null,
    [addresses],
  );

  return (
    <>
      <Grid container alignItems="center">
        <Grid item xs={6} style={{ paddingRight: 16 }}>
          <ListItemText
            primary={
              <Typography component="span" variant="h6" noWrap>
                <Box component="span" display="flex" alignItems="center">
                  {name}
                </Box>
              </Typography>
            }
            secondary={
              <>
                {people?.map(
                  (person, idx) =>
                    person && (
                      <PersonData person={person} key={`person-${idx}`} />
                    ),
                )}

                {primaryAddress && (
                  <Hidden smDown>
                    <Typography component="span" variant="body2">
                      {[
                        primaryAddress.street,
                        primaryAddress.city,
                        primaryAddress.state,
                        primaryAddress.postalCode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </Typography>
                  </Hidden>
                )}
              </>
            }
          />
        </Grid>

        <Grid item xs={3}>
          <ListItemText
            primary={
              <Typography component="span" variant="h6">
                <Box component="span" display="flex" alignItems="center">
                  {accountList?.name}
                </Box>
              </Typography>
            }
            secondary={accountList?.accountListUsers?.map(
              (person, idx) =>
                person && <PersonData person={person} key={`person-${idx}`} />,
            )}
          />
        </Grid>
        <Grid item xs={3} style={{ paddingRight: 16, textAlign: 'right' }}>
          <Box>
            {allowDeletion && (
              <Button
                variant="contained"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
                size="small"
              >
                <Delete fontSize="small" style={styles.buttonIcon} />{' '}
                {t('Delete')}
              </Button>
            )}
            <Button
              variant="contained"
              color="error"
              onClick={() => setAnonymizeDialogOpen(true)}
              size="small"
              sx={{ ml: '7px' }}
              className="ml-1"
            >
              <Lock fontSize="small" style={styles.buttonIcon} />{' '}
              {t('Anonymize')}
            </Button>
          </Box>
        </Grid>
      </Grid>
      {allowDeletion && (
        <Confirmation
          isOpen={deleteDialogOpen}
          title={t('Confirm')}
          subtitle={t(
            'Are you sure you want to delete {{name}} from {{orgName}}?',
            {
              name: name,
              orgName: selectedOrganizationName,
            },
          )}
          message={t(
            "This is permanent and can't be recovered. This person will be deleted only in your MPDx organization. You can request removal across all other systems at dsar@cru.org. Only delete a contact if you need to fulfill a legal requirement or the person has made this request, AND you are 100% confident that you are looking at the correct contact.",
          )}
          handleClose={() => setDeleteDialogOpen(false)}
          mutation={handleDeleteContact}
        />
      )}
      <Confirmation
        isOpen={anonymizeDialogOpen}
        title={t('Confirm')}
        subtitle={t(
          'Are you sure you want to anonymize {{name}} in {{orgName}}?',
          {
            name: name,
            orgName: selectedOrganizationName,
          },
        )}
        message={t(
          "This is permanent and can't be recovered. This person will be removed only in your MPDx organization. You can request removal across all other systems at dsar@cru.org. Only anonymize a contact if you need to fulfill a legal requirement or the person has made this request, AND you are 100% confident that you are looking at the correct contact.",
        )}
        handleClose={() => setAnonymizeDialogOpen(false)}
        mutation={handleAnonymizeContact}
      />
    </>
  );
};
