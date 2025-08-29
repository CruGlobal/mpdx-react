import React, { ReactElement } from 'react';
import { ApolloCache } from '@apollo/client';
import {
  Checkbox,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  TextField,
} from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { AddressLocationSelect } from 'src/common/Selects/AddressLocationSelect';
import {
  ContactEditContainer,
  ContactInputWrapper,
} from 'src/components/Shared/styledComponents/ContactStyling';
import { LoadingIndicator } from 'src/components/Shared/styledComponents/LoadingStyling';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { useUpdateCache } from 'src/hooks/useUpdateCache';
import Modal from '../../../../../common/Modal/Modal';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
} from '../../ContactDetailsTab.generated';
import { useSetContactPrimaryAddressMutation } from '../SetPrimaryAddress.generated';
import { StreetAutocomplete } from '../StreetAutocomplete/StreetAutocomplete';
import { AddressSchema, addressSchema } from '../addressSchema';
import { useCreateContactAddressMutation } from './CreateContactAddress.generated';

interface EditContactAddressModalProps {
  accountListId: string;
  contactId: string;
  handleClose: () => void;
  handleUpdateCache?: (cache: ApolloCache<unknown>, object) => void;
}

export const AddAddressModal: React.FC<EditContactAddressModalProps> = ({
  accountListId,
  contactId,
  handleClose,
  handleUpdateCache,
}): ReactElement<EditContactAddressModalProps> => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [createContactAddress, { loading: updating }] =
    useCreateContactAddressMutation();
  const [setContactPrimaryAddress, { loading: settingPrimaryAddress }] =
    useSetContactPrimaryAddressMutation();
  const { update } = useUpdateCache(contactId);

  const onSubmit = async ({
    primaryMailingAddress,
    street,
    ...attributes
  }: AddressSchema) => {
    const response = await createContactAddress({
      variables: {
        accountListId,
        attributes: {
          contactId,
          street: street ?? '',
          ...attributes,
        },
      },
      update: (cache, { data: createdAddressData }) => {
        if (handleUpdateCache) {
          handleUpdateCache(cache, {
            createAddress: {
              address: createdAddressData?.createAddress?.address,
              contactId,
            },
          });
        } else {
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
                  nodes: [
                    ...dataFromCache.contact.addresses.nodes,
                    { ...createdAddressData?.createAddress?.address },
                  ],
                },
              },
            };
            cache.writeQuery({ ...query, data });
          }
        }
      },
    });
    const newAddressId = response.data?.createAddress?.address?.id;
    if (primaryMailingAddress && newAddressId) {
      await setContactPrimaryAddress({
        variables: {
          contactId,
          primaryAddressId: newAddressId,
        },
        update,
      });
    }
    enqueueSnackbar(t('Address added successfully'), {
      variant: 'success',
    });
    handleClose();
  };

  return (
    <Modal isOpen={true} title={t('Add Address')} handleClose={handleClose}>
      <Formik
        initialValues={{
          city: '',
          country: '',
          historic: false,
          location: '',
          metroArea: '',
          postalCode: '',
          region: '',
          state: '',
          street: '',
          primaryMailingAddress: true,
        }}
        validationSchema={addressSchema}
        validateOnMount
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
                      />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                      <FormControl fullWidth>
                        <InputLabel id="location-select-label">
                          {t('Location')}
                        </InputLabel>
                        <AddressLocationSelect
                          name="location"
                          labelId="location-select-label"
                          value={location}
                          onChange={handleChange}
                        />
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
                        checked={Boolean(historic)}
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
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton disabled={!isValid || isSubmitting}>
                {(updating || settingPrimaryAddress) && (
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
