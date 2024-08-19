import React, { useMemo, useState } from 'react';
import { Lock } from '@mui/icons-material';
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
import { Trans, useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import {
  ContactPeople,
  ContactPeopleAccountListsUsers,
  OrganizationsContact,
} from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useAnonymizeContactMutation } from '../Contact.generated';

interface Props {
  contact: OrganizationsContact;
  selectedOrganizationName: string;
}
interface PersonDataProps {
  person: ContactPeople;
}
interface UserDataProps {
  person: ContactPeopleAccountListsUsers;
}

const StyledBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  justifyContent: 'flex-start',
}));

const ContactPersonData: React.FC<PersonDataProps> = ({ person }) => {
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
          target="_blank"
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
const UserPersonData: React.FC<UserDataProps> = ({ person }) => {
  const email =
    person?.userEmailAddresses &&
    person?.userEmailAddresses.find((email) => email?.primary);
  return (
    <StyledBox>
      <Typography component="span" variant="body2">
        {person?.userFirstName} {person?.userLastName}
      </Typography>
      {email && (
        <Link
          underline="hover"
          key={`email-${email.email}`}
          href={`mailto:${email.email}`}
          target="_blank"
        >
          {email.email}
        </Link>
      )}
    </StyledBox>
  );
};

export const ContactRow: React.FC<Props> = ({ contact }) => {
  const { t } = useTranslation();
  const [anonymizeDialogOpen, setAnonymizeDialogOpen] = useState(false);
  const [anonymizeContact] = useAnonymizeContactMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();

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

  const { name, people, addresses, accountList } = contact;

  const primaryAddress = useMemo(
    () =>
      addresses?.find((address) => address?.primaryMailingAddress) || addresses
        ? addresses[0]
        : null,
    [addresses],
  );
  const primaryAddressString = useMemo(
    () =>
      [
        primaryAddress?.street,
        primaryAddress?.city,
        primaryAddress?.state,
        primaryAddress?.postalCode,
      ]
        .filter(Boolean)
        .join(', '),
    [primaryAddress],
  );

  return (
    <>
      <Grid container alignItems="center">
        <Grid item xs={6} sx={{ paddingRight: 2 }}>
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
                      <ContactPersonData
                        person={person}
                        key={`person-${idx}`}
                      />
                    ),
                )}

                {primaryAddress && (
                  <Hidden smDown>
                    <Typography component="span" variant="body2">
                      {primaryAddressString}
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
                person && (
                  <UserPersonData person={person} key={`person-${idx}`} />
                ),
            )}
          />
        </Grid>
        <Grid item xs={3} sx={{ paddingRight: '16px', textAlign: 'right' }}>
          <Box>
            <Button
              variant="contained"
              color="error"
              onClick={() => setAnonymizeDialogOpen(true)}
              size="small"
              sx={{ ml: '7px' }}
              className="ml-1"
            >
              <Lock fontSize="small" sx={{ marginRight: '7px' }} />{' '}
              {t('Anonymize')}
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Confirmation
        isOpen={anonymizeDialogOpen}
        title={t('Confirm')}
        subtitle={
          <Trans
            t={t}
            defaults="Are you sure you want to anonymize <i>{{name}}</i> in <i>{{accountList}}</i>?"
            values={{
              name,
              accountList: accountList?.name,
            }}
            shouldUnescape={true}
          />
        }
        message={
          <Trans
            t={t}
            defaults="<p>This contact will be anonymized in your {{appName}} organization. This is permanent and can't be recovered. Only anonymize if you are 100% confident that you are looking at the correct contact.</p><p>A contact placeholder will remain with a name like “DataPrivacy, Deleted”. Gift data will remain. Other data such as notes and tasks will be removed. Status will be set as “Never Ask”. Newsletter set to 'N/A'. You can request removal across all other systems at dsar@cru.org.</p>"
            values={{
              appName,
            }}
            shouldUnescape={true}
          />
        }
        handleClose={() => setAnonymizeDialogOpen(false)}
        mutation={handleAnonymizeContact}
      />
    </>
  );
};
