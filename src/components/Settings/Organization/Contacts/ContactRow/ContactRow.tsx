import React, { useMemo, useState } from 'react';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
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
import { useDeleteOrganizationContactMutation } from '../Contact.generated';

const DeleteOutline = styled(DeleteOutlined)(({ theme }) => ({
  width: '24px',
  height: '24px',
  marginRight: '10px',
  color: theme.palette.common.white,
}));

interface Props {
  contact: OrganizationsContact;
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

const SpaceBetweenBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
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
        <Typography key={`phone-${phone.number}`} component="span">
          {phone.number}
        </Typography>
      )}
    </StyledBox>
  );
};

export const ContactRow: React.FC<Props> = ({ contact }) => {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteOrganizationContact] = useDeleteOrganizationContactMutation();
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
        <Grid item xs={10} md={6} style={{ paddingRight: 16 }}>
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
                      ].join(', ')}
                    </Typography>
                  </Hidden>
                )}
              </>
            }
          />
        </Grid>

        <Grid item xs={2} md={6}>
          <SpaceBetweenBox>
            <ListItemText
              primary={
                <Typography component="span" variant="h6" noWrap>
                  <Box component="span" display="flex" alignItems="center">
                    {accountList?.name}
                  </Box>
                </Typography>
              }
              secondary={accountList?.accountListUsers?.map(
                (person, idx) =>
                  person && (
                    <PersonData person={person} key={`person-${idx}`} />
                  ),
              )}
            />

            <Box>
              <Button
                variant="contained"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <DeleteOutline /> {allowDeletion ? t('Delete') : t('Anonymize')}
              </Button>
            </Box>
          </SpaceBetweenBox>
        </Grid>
      </Grid>

      <Confirmation
        isOpen={deleteDialogOpen}
        title={t('Confirm')}
        message={
          allowDeletion
            ? t(
                'Are you sure you want to delete {{name}} from {{accountList}}?',
                {
                  name: name,
                  accountList: accountList?.name,
                },
              )
            : t(
                'Are you sure you want to anonymize {{name}} from {{accountList}}?',
                {
                  name: name,
                  accountList: accountList?.name,
                },
              )
        }
        handleClose={() => setDeleteDialogOpen(false)}
        mutation={handleDeleteContact}
      />
    </>
  );
};
