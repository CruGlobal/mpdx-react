import React, { ReactElement } from 'react';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  Box,
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AddressCreateInput } from '../../../../../../../graphql/types.generated';
import Modal from '../../../../../common/Modal/Modal';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
} from '../../ContactDetailsTab.generated';
import { useCreateContactAddressMutation } from './CreateContactAddress.generated';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { useUpdateCache } from '../useUpdateCache';
import { useSetContactPrimaryAddressMutation } from '../SetPrimaryAddress.generated';
import { StreetAutocomplete } from '../StreetAutocomplete/StreetAutocomplete';
import { createAddressSchema } from './createAddressSchema';

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

export const AddAddressModal: React.FC<EditContactAddressModalProps> = ({
  accountListId,
  contactId,
  handleClose,
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
    ...attributes
  }: Omit<AddressCreateInput, 'validValues'> & {
    primaryMailingAddress: boolean;
  }) => {
    const response = await createContactAddress({
      variables: {
        accountListId,
        attributes,
      },
      update: (cache, { data: createdAddressData }) => {
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
    await handleClose();
  };

  return (
    <Modal isOpen={true} title={t('Add Address')} handleClose={handleClose}>
      <Formik
        initialValues={{
          contactId,
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
        validationSchema={createAddressSchema}
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
                          required: true,
                          fullWidth: true,
                        }}
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
                    <Grid item xs={12} sm={6} md={6}>
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
                    <Grid item xs={12} sm={6} md={6}>
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
