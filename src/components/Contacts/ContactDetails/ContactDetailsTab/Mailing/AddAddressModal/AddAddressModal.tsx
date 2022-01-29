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
import { AddressCreateInput } from '../../../../../../../graphql/types.generated';
import Modal from '../../../../../common/Modal/Modal';
import { useCreateContactAddressMutation } from './CreateContactAddress.generated';

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
  const [
    createContactAddress,
    { loading: updating },
  ] = useCreateContactAddressMutation();

  const contactAddressSchema: yup.SchemaOf<
    Omit<AddressCreateInput, 'id'>
  > = yup.object({
    contactId: yup.string().required(),
    city: yup.string().nullable(),
    country: yup.string().nullable(),
    historic: yup.boolean().nullable(),
    location: yup.string().nullable(),
    metroArea: yup.string().nullable(),
    postalCode: yup.string().nullable(),
    region: yup.string().nullable(),
    state: yup.string().nullable(),
    street: yup.string().required(),
  });

  const onSubmit = async (
    attributes: Omit<AddressCreateInput, 'validValues' | 'id'>,
  ) => {
    await createContactAddress({
      variables: {
        accountListId,
        attributes,
      },
    });
    enqueueSnackbar(t('Address added successfully'), {
      variant: 'success',
    });
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
                    <Grid item sm={12} md={9}>
                      <TextField
                        label={t('Street')}
                        value={street}
                        required
                        onChange={handleChange('street')}
                        inputProps={{ 'aria-label': t('Street') }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
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
                    <Grid item sm={12} md={6}>
                      <TextField
                        label={t('City')}
                        value={city}
                        onChange={handleChange('city')}
                        inputProps={{ 'aria-label': t('City') }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item sm={12} md={3}>
                      <TextField
                        label={t('State')}
                        value={state}
                        onChange={handleChange('state')}
                        inputProps={{ 'aria-label': t('State') }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item sm={12} md={3}>
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
                    <Grid item sm={12} md={6}>
                      <TextField
                        label={t('Country')}
                        value={country}
                        onChange={handleChange('country')}
                        inputProps={{ 'aria-label': t('Country') }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item sm={12} md={3}>
                      <TextField
                        label={t('Region')}
                        value={region}
                        onChange={handleChange('region')}
                        inputProps={{ 'aria-label': t('Region') }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item sm={12} md={3}>
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
