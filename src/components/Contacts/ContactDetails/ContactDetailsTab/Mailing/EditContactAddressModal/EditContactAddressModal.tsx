import React, { ReactElement } from 'react';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  Alert,
  AlertTitle,
  Box,
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ContactMailingFragment } from '../ContactMailing.generated';
import { AddressUpdateInput } from '../../../../../../../graphql/types.generated';
import Modal from '../../../../../common/Modal/Modal';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
} from '../../ContactDetailsTab.generated';
import {
  useDeleteContactAddressMutation,
  useDonationServicesEmailQuery,
  useUpdateContactAddressMutation,
} from './EditContactAddress.generated';
import {
  SubmitButton,
  CancelButton,
  DeleteButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { useUpdateCache } from '../useUpdateCache';
import { useSetContactPrimaryAddressMutation } from '../SetPrimaryAddress.generated';
import { StreetAutocomplete } from '../StreetAutocomplete/StreetAutocomplete';
import { updateAddressSchema } from './updateAddressSchema';

const ContactEditContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  margin: theme.spacing(4, 0),
}));

const ContactInputWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(0, 6),
  margin: theme.spacing(2, 0),
}));

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

interface EditContactAddressModalProps {
  accountListId: string;
  address: ContactMailingFragment['addresses']['nodes'][0];
  contactId: string;
  handleClose: () => void;
}

enum AddressLocationEnum {
  Home = 'Home',
  Business = 'Business',
  Mailing = 'Mailing',
  Seasonal = 'Seasonal',
  Other = 'Other',
  Temporary = 'Temporary',
  RepAddress = 'Rep Address',
}

export const EditContactAddressModal: React.FC<
  EditContactAddressModalProps
> = ({
  accountListId,
  address,
  contactId,
  handleClose,
}): ReactElement<EditContactAddressModalProps> => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateContactAddress, { loading: updating }] =
    useUpdateContactAddressMutation();
  const [deleteAddress, { loading: deleting }] =
    useDeleteContactAddressMutation();
  const [setContactPrimaryAddress, { loading: settingPrimaryAddress }] =
    useSetContactPrimaryAddressMutation();
  const { update } = useUpdateCache(contactId);

  const onSubmit = async ({
    primaryMailingAddress,
    ...attributes
  }: Omit<AddressUpdateInput, 'validValues'> & {
    primaryMailingAddress: boolean;
  }) => {
    await updateContactAddress({
      variables: {
        accountListId,
        attributes,
      },
    });
    // updateContactAddress doesn't set support setting the primaryMailingAddress field, so if
    // that field changes, then use the setContactPrimaryAddress mutation to update it
    if (address.primaryMailingAddress !== primaryMailingAddress) {
      await setContactPrimaryAddress({
        variables: {
          contactId,
          primaryAddressId: primaryMailingAddress ? address.id : null,
        },
        update,
      });
    }
    enqueueSnackbar(t('Address updated successfully'), {
      variant: 'success',
    });
    handleClose();
  };

  const deleteContactAddress = async (): Promise<void> => {
    if (address) {
      await deleteAddress({
        variables: {
          id: address.id,
          accountListId,
        },
        update: (cache, { data: deletedContactAddress }) => {
          const deletedAddressId = deletedContactAddress?.deleteAddress?.id;
          const query = {
            query: ContactDetailsTabDocument,
            variables: {
              accountListId,
              contactId,
            },
          };

          const dataFromCache = cache.readQuery<ContactDetailsTabQuery>(query);

          if (dataFromCache) {
            const data = {
              ...dataFromCache,
              contact: {
                ...dataFromCache.contact,
                addresses: {
                  ...dataFromCache.contact.addresses,
                  nodes: dataFromCache.contact.addresses.nodes.filter(
                    (address) => address.id !== deletedAddressId,
                  ),
                },
              },
            };
            cache.writeQuery({ ...query, data });
          }
          enqueueSnackbar(t('Address deleted successfully'), {
            variant: 'success',
          });
        },
      });
    }
    handleClose();
  };

  const editingDisabled = address.source === 'Siebel';
  const { data: emailData } = useDonationServicesEmailQuery({
    variables: {
      accountListId,
      contactId,
    },
    skip: !editingDisabled,
  });
  const requestEmailUpdateBody = (): string => {
    if (!emailData) {
      return '';
    }

    const donorAccount = address.sourceDonorAccount;
    const donorName = donorAccount
      ? `${emailData.contact.name} (ministry partner #${donorAccount.accountNumber})`
      : emailData.contact.name;
    const previousAddress = address.street
      ? `\nThey were previously located at:\n${address.street}\n${address.city}, ` +
        `${address.state} ${address.postalCode}\n`
      : ' ';
    return (
      `Dear Donation Services,\n\nOne of my ministry partners, ${donorName} ` +
      `has a new current address.\n${previousAddress}\nPlease update their address to:\n` +
      'REPLACE WITH NEW STREET\nREPLACE WITH NEW CITY, STATE, ZIP\n\nThanks,\n\n' +
      `${emailData.user.firstName}`
    );
  };

  return (
    <Modal isOpen={true} title={t('Edit Address')} handleClose={handleClose}>
      <Formik
        initialValues={{
          id: address.id,
          city: address.city ?? '',
          country: address.country ?? '',
          historic: address.historic,
          location: address.location ?? '',
          metroArea: address.metroArea ?? '',
          postalCode: address.postalCode ?? '',
          region: address.region ?? '',
          state: address.state ?? '',
          street: address.street ?? '',
          primaryMailingAddress: address.primaryMailingAddress ?? false,
        }}
        validationSchema={updateAddressSchema}
        onSubmit={onSubmit}
      >
        {({
          values: {
            city,
            country,
            historic,
            location,
            metroArea,
            postalCode,
            region,
            state,
            street,
            primaryMailingAddress,
          },
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
          setFieldValue,
        }): ReactElement => (
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent dividers>
              <ContactEditContainer>
                {editingDisabled && (
                  <ContactInputWrapper>
                    <Alert severity="info">
                      <AlertTitle sx={{ fontWeight: 'bold' }}>
                        {t('This address is provided by Donation Services')}
                      </AlertTitle>
                      <p>
                        {t(
                          'The address that syncs with Donation Services cannot be edited here. Please email Donation Services with the updated address, or you can create a new address and select it as your primary mailing address.',
                        )}
                      </p>
                      {emailData && (
                        <p>
                          <Link
                            href={`mailto:donation.services@cru.org?subject=Donor+address+change&body=${encodeURIComponent(
                              requestEmailUpdateBody(),
                            )}`}
                            sx={{ fontWeight: 'bold' }}
                          >
                            {t('Email Donation Services here')}
                          </Link>
                        </p>
                      )}
                    </Alert>
                  </ContactInputWrapper>
                )}
                <ContactInputWrapper>
                  <Grid container spacing={1}>
                    <Grid item sm={12} md={9}>
                      <StreetAutocomplete
                        streetValue={street}
                        onStreetChange={(street) =>
                          setFieldValue('street', street)
                        }
                        onPredictionChosen={(fields) => {
                          Object.entries(fields).forEach(([field, value]) => {
                            setFieldValue(field, value);
                          });
                          if (!location) {
                            setFieldValue('location', 'Home');
                          }
                        }}
                        TextFieldProps={{
                          name: 'street',
                          label: t('Street'),
                          required: true,
                          fullWidth: true,
                        }}
                        disabled={editingDisabled}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel id="location-select-label">
                          {t('Location')}
                        </InputLabel>
                        <Select
                          name="location"
                          label={t('Location')}
                          labelId="location-select-label"
                          value={location}
                          onChange={handleChange}
                          fullWidth
                        >
                          {Object.values(AddressLocationEnum).map((value) => (
                            <MenuItem
                              key={value}
                              value={value}
                              aria-label={t(value)}
                            >
                              {t(value)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <Grid container spacing={1}>
                    <Grid item sm={12} md={6}>
                      <TextField
                        name="city"
                        label={t('City')}
                        value={city}
                        onChange={handleChange}
                        inputProps={{ 'aria-label': t('City') }}
                        fullWidth
                        disabled={editingDisabled}
                      />
                    </Grid>
                    <Grid item sm={12} md={3}>
                      <TextField
                        name="state"
                        label={t('State')}
                        value={state}
                        onChange={handleChange}
                        inputProps={{ 'aria-label': t('State') }}
                        fullWidth
                        disabled={editingDisabled}
                      />
                    </Grid>
                    <Grid item sm={12} md={3}>
                      <TextField
                        name="postalCode"
                        label={t('Zip')}
                        value={postalCode}
                        onChange={handleChange}
                        inputProps={{ 'aria-label': t('Zip') }}
                        fullWidth
                        disabled={editingDisabled}
                      />
                    </Grid>
                  </Grid>
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <Grid container spacing={1}>
                    <Grid item sm={12} md={6}>
                      <TextField
                        name="country"
                        label={t('Country')}
                        value={country}
                        onChange={handleChange}
                        inputProps={{ 'aria-label': t('Country') }}
                        fullWidth
                        disabled={editingDisabled}
                      />
                    </Grid>
                    <Grid item sm={12} md={3}>
                      <TextField
                        name="region"
                        label={t('Region')}
                        value={region}
                        onChange={handleChange}
                        inputProps={{ 'aria-label': t('Region') }}
                        fullWidth
                        disabled={editingDisabled}
                      />
                    </Grid>
                    <Grid item sm={12} md={3}>
                      <TextField
                        name="metroArea"
                        label={t('Metro')}
                        value={metroArea}
                        onChange={handleChange}
                        inputProps={{ 'aria-label': t('Metro') }}
                        fullWidth
                        disabled={editingDisabled}
                      />
                    </Grid>
                  </Grid>
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="primaryMailingAddress"
                        checked={primaryMailingAddress}
                        onChange={handleChange}
                      />
                    }
                    label={t('Primary')}
                  />
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="historic"
                        checked={historic}
                        onChange={handleChange}
                        color="secondary"
                      />
                    }
                    label={t('Address no longer valid')}
                  />
                </ContactInputWrapper>
              </ContactEditContainer>
            </DialogContent>
            <DialogActions>
              {address && <DeleteButton onClick={deleteContactAddress} />}
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton disabled={!isValid || isSubmitting}>
                {(updating || deleting || settingPrimaryAddress) && (
                  <LoadingIndicator color="primary" size={20} />
                )}
                {t('Save')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
