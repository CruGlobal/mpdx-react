import React, { ReactElement } from 'react';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
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
  styled,
  TextField,
} from '@material-ui/core';
import { ContactMailingFragment } from '../ContactMailing.generated';
import { AddressUpdateInput } from '../../../../../../../graphql/types.generated';
import Modal from '../../../../../common/Modal/Modal';
import { useUpdateContactAddressMutation } from './EditContactAddress.generated';

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

export const EditContactAddressModal: React.FC<EditContactAddressModalProps> = ({
  accountListId,
  address,
  handleClose,
}): ReactElement<EditContactAddressModalProps> => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [
    updateContactAddress,
    { loading: updating },
  ] = useUpdateContactAddressMutation();

  // TODO Remove Omit once https://jira.cru.org/browse/MPDX-7090 is complete
  const contactAddressSchema: yup.SchemaOf<
    Omit<AddressUpdateInput, 'contactId'>
  > = yup.object({
    city: yup.string().nullable(),
    country: yup.string().nullable(),
    historic: yup.boolean().nullable(),
    id: yup.string().required(),
    location: yup.string().nullable(),
    metroArea: yup.string().nullable(),
    postalCode: yup.string().nullable(),
    region: yup.string().nullable(),
    state: yup.string().nullable(),
    street: yup.string().nullable(),
  });

  const onSubmit = async (
    attributes: Omit<AddressUpdateInput, 'contactId'>,
  ) => {
    try {
      await updateContactAddress({
        variables: {
          accountListId,
          attributes,
        },
      });
      enqueueSnackbar(t('Address updated successfully'), {
        variant: 'success',
      });
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
      throw error;
    }
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
        }}
        validationSchema={contactAddressSchema}
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
          },
          handleChange,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent dividers>
              <ContactEditContainer>
                <ContactInputWrapper>
                  <Grid container spacing={1}>
                    <Grid item xs={9}>
                      <TextField
                        label={t('Street')}
                        value={street}
                        onChange={handleChange('street')}
                        inputProps={{ 'aria-label': t('Street') }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <FormControl fullWidth>
                        <InputLabel id="location-select-label">
                          {t('Location')}
                        </InputLabel>
                        <Select
                          labelId="location-select-label"
                          value={location}
                          onChange={handleChange('location')}
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
                    <Grid item xs={6}>
                      <TextField
                        label={t('City')}
                        value={city}
                        onChange={handleChange('city')}
                        inputProps={{ 'aria-label': t('City') }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        label={t('State')}
                        value={state}
                        onChange={handleChange('state')}
                        inputProps={{ 'aria-label': t('State') }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        label={t('Zip')}
                        value={postalCode}
                        onChange={handleChange('postalCode')}
                        inputProps={{ 'aria-label': t('Zip') }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </ContactInputWrapper>
                <ContactInputWrapper>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <TextField
                        label={t('Country')}
                        value={country}
                        onChange={handleChange('country')}
                        inputProps={{ 'aria-label': t('Country') }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        label={t('Region')}
                        value={region}
                        onChange={handleChange('region')}
                        inputProps={{ 'aria-label': t('Region') }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        label={t('Metro')}
                        value={metroArea}
                        onChange={handleChange('metroArea')}
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
                        checked={historic}
                        onChange={() => setFieldValue('historic', !historic)}
                      />
                    }
                    label={t('Address no longer valid')}
                  />
                </ContactInputWrapper>
              </ContactEditContainer>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                disabled={isSubmitting}
                variant="text"
              >
                {t('Cancel')}
              </Button>
              <Button
                color="primary"
                type="submit"
                variant="contained"
                disabled={!isValid || isSubmitting}
              >
                {updating && <LoadingIndicator color="primary" size={20} />}
                {t('Save')}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
