import React, { ReactElement } from 'react';
import { ApolloCache } from '@apollo/client';
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
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  DeleteButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { useUpdateCache } from 'src/hooks/useUpdateCache';
import { isEditableSource } from 'src/utils/sourceHelper';
import Modal from '../../../../../common/Modal/Modal';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
} from '../../ContactDetailsTab.generated';
import {
  AddressLocationEnum,
  getLocalizedAddressLocation,
} from '../AddressLocation';
import { ContactMailingFragment } from '../ContactMailing.generated';
import { useSetContactPrimaryAddressMutation } from '../SetPrimaryAddress.generated';
import { StreetAutocomplete } from '../StreetAutocomplete/StreetAutocomplete';
import { AddressSchema, addressSchema } from '../addressSchema';
import {
  useDeleteContactAddressMutation,
  useDonationServicesEmailQuery,
  useUpdateContactAddressMutation,
} from './EditContactAddress.generated';
import { generateEmailBody } from './helpers';

const ContactEditContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  margin: theme.spacing(1, 0),
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
  handleUpdateCacheOnDelete?: (cache: ApolloCache<unknown>, object) => void;
}

export const EditContactAddressModal: React.FC<
  EditContactAddressModalProps
> = ({
  accountListId,
  address,
  contactId,
  handleClose,
  handleUpdateCacheOnDelete,
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
    street,
    ...attributes
  }: AddressSchema) => {
    await updateContactAddress({
      variables: {
        accountListId,
        attributes: {
          id: address.id,
          street: street ?? '',
          ...attributes,
        },
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
        update: (cache) => {
          const deletedAddressId = address.id;
          if (handleUpdateCacheOnDelete) {
            handleUpdateCacheOnDelete(cache, { deletedAddressId });
          } else {
            const query = {
              query: ContactDetailsTabDocument,
              variables: {
                accountListId,
                contactId,
              },
            };

            const dataFromCache =
              cache.readQuery<ContactDetailsTabQuery>(query);

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
          }
          enqueueSnackbar(t('Address deleted successfully'), {
            variant: 'success',
          });
        },
      });
    }
    handleClose();
  };

  const editingDisabled = !isEditableSource(address.source);
  const { data: emailData } = useDonationServicesEmailQuery({
    variables: {
      accountListId,
      contactId,
    },
    skip: !editingDisabled,
  });

  return (
    <Modal isOpen={true} title={t('Edit Address')} handleClose={handleClose}>
      <Formik
        initialValues={{
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
        validationSchema={addressSchema}
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
                    {address.source === 'Siebel' && (
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
                              href={`mailto:${
                                process.env.DONATION_SERVICES_EMAIL
                              }?subject=Donor+address+change&body=${encodeURIComponent(
                                generateEmailBody(emailData, address),
                              )}`}
                              underline="hover"
                              sx={{ fontWeight: 'bold' }}
                            >
                              {t('Email Donation Services here')}
                            </Link>
                          </p>
                        )}
                      </Alert>
                    )}
                    {address.source === 'DataServer' && (
                      <Alert severity="info">
                        <AlertTitle sx={{ fontWeight: 'bold' }}>
                          {t('This address is provided by your organization.')}
                        </AlertTitle>
                        <p>
                          {t(
                            'The address that syncs with your organization’s donations cannot be edited here. Please email your donation department with the updated address, or you can create a new address and select it as your primary mailing address.',
                          )}
                        </p>
                      </Alert>
                    )}
                  </ContactInputWrapper>
                )}
                <ContactInputWrapper>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={8} md={9}>
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
                          fullWidth: true,
                        }}
                        disabled={editingDisabled}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
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
                              aria-label={getLocalizedAddressLocation(t, value)}
                            >
                              {getLocalizedAddressLocation(t, value)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6} md={3}>
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
                    <Grid item xs={12} sm={6} md={3}>
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
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6} md={3}>
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
                    <Grid item xs={12} sm={6} md={3}>
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
                  <br />
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
              {address && !editingDisabled && (
                <DeleteButton onClick={deleteContactAddress} />
              )}
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
