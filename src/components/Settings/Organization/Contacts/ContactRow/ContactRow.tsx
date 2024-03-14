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
import { useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import {
  ContactPeople,
  ContactPeopleAccountListsUsers,
  OrganizationsContact,
} from 'src/graphql/types.generated';
import { useAnonymizeContactMutation } from '../Contact.generated';

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

export const ContactRow: React.FC<Props> = ({ contact }) => {
  const { t } = useTranslation();
  const [anonymizeDialogOpen, setAnonymizeDialogOpen] = useState(false);
  const [anonymizeContact] = useAnonymizeContactMutation();
  const { enqueueSnackbar } = useSnackbar();

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
        <Grid item xs={6} sx={{ paddingRight: '16px' }}>
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
                person && <PersonData person={person} key={`person-${idx}`} />,
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
        subtitle={t(
          'Are you sure you want to anonymize {{name}} in {{accountList}}?',
          {
            name: name.toLocaleUpperCase(),
            accountList: accountList?.name?.toLocaleUpperCase(),
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
