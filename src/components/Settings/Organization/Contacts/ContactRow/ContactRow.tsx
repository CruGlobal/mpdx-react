import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Grid,
  Hidden,
  ListItemText,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import * as Types from '../../../../../../graphql/types.generated';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import {
  useDeleteOrganizationContactMutation,
  SearchOrganizationsContactsDocument,
  SearchOrganizationsContactsQuery,
} from '../contact.generated';
import { useSnackbar } from 'notistack';

const DeleteOutline = styled(DeleteOutlined)(({ theme }) => ({
  width: '24px',
  height: '24px',
  marginRight: '10px',
  color: theme.palette.common.white,
}));

interface Props {
  contact: Types.OrganizationsContact;
  selectedOrganizationId: string;
  contactSearch: string;
  useTopMargin?: boolean;
}
interface PersonDataProps {
  person: Types.ContactPeople | Types.ContactPeopleAccountListsUsers;
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
        <Link key={`email-${email.email}`} href={`mailto:${email.email}`}>
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

export const ContactRow: React.FC<Props> = ({
  contact,
  selectedOrganizationId,
  contactSearch,
  useTopMargin,
}) => {
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
        const query = {
          query: SearchOrganizationsContactsDocument,
          variables: {
            input: {
              organizationId: selectedOrganizationId,
              search: contactSearch,
            },
          },
        };
        const dataFromCache =
          cache.readQuery<SearchOrganizationsContactsQuery>(query);

        if (dataFromCache) {
          const removedAccountFromCache =
            dataFromCache?.searchOrganizationsContacts.contacts.filter(
              (orgContact) => orgContact?.id !== contact.id,
            );
          const data = {
            ...dataFromCache,
            searchOrganizationsContacts: {
              ...dataFromCache?.searchOrganizationsContacts,
              contacts: removedAccountFromCache,
            },
          };
          cache.writeQuery({ ...query, data });
        }
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

  const ListItemButton = styled(ButtonBase)(({ theme }) => ({
    flex: '1 1 auto',
    textAlign: 'left',
    marginTop: useTopMargin ? '16px' : '0',
    padding: theme.spacing(0, 0.5, 0, 2),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(0, 0.5),
    },
  }));

  const { name, people, addresses, accountList, allowDeletion } = contact;

  const primaryAddress = useMemo(
    () =>
      addresses?.find((address) => address?.primaryMailingAddress) || addresses
        ? addresses[0]
        : null,
    [addresses],
  );

  return (
    <ListItemButton data-testid="rowButton">
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
            <Box>
              {accountList?.accountListUsers?.map(
                (person, idx) =>
                  person && (
                    <PersonData person={person} key={`person-${idx}`} />
                  ),
              )}
            </Box>

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
          Creator Delete Button
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
    </ListItemButton>
  );
};
