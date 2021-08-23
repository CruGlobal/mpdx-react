import React, { ReactElement } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  IconButton,
  MenuItem,
  styled,
  TextField,
} from '@material-ui/core';
import Grid, { GridSpacing } from '@material-ui/core/Grid';
import { DatePicker } from '@material-ui/pickers';
import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';
import { DonationCreateInput } from '../../../../../../../../../graphql/types.generated';

interface Props {
  accountListId: string;
  handleClose: () => void;
}

const CreateDonationTitle = styled(DialogTitle)(() => ({
  textTransform: 'uppercase',
  textAlign: 'center',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: '#EBECEC',
  },
}));

const LogFormControl = styled(FormControl)(() => ({
  width: '100%',
}));

const LogFormLabel = styled(FormLabel)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  fontWeight: 'bold',
  color: theme.palette.primary.dark,
  '& span': {
    color: theme.palette.error.main,
  },
}));

const LogButton = styled(Button)(({}) => ({
  height: 40,
  textTransform: 'none',
}));

const donationSchema: yup.SchemaOf<
  Omit<DonationCreateInput, 'id' | 'paymentMethod'>
> = yup.object({
  amount: yup.number().required(),
  currency: yup.string().required(),
  appealId: yup.string().nullable(),
  appealAmount: yup.number().nullable(),
  donationDate: yup.string().required(),
  donorAccountId: yup.string().required(),
  designationAccountId: yup.string().required(),
  motivation: yup.string().nullable(),
  memo: yup.string().nullable(),
});

const currencies = ['USD', 'GBP', 'EUR'];

const CreateDonationModal: React.FC<Props> = ({ handleClose }) => {
  const { t } = useTranslation();

  const gridSpacing: GridSpacing = 2;

  const initialDonation: DonationCreateInput = {
    amount: 0.0,
    currency: '',
    donationDate: '',
    donorAccountId: '',
    designationAccountId: '',
  };

  const openPartnerAccountModal = () => {
    //TODO: open partner account modal
  };

  const openDesignationAccountModal = () => {
    //TODO: open designation account modal
  };

  const openAppealModal = () => {
    //TODO: open partner account modal
  };

  const handleSubmit = () => {
    //TODO: Submit Method
  };

  return (
    <Formik
      initialValues={initialDonation}
      validationSchema={donationSchema}
      onSubmit={handleSubmit}
    >
      {({
        values: {
          amount,
          currency,
          appealId,
          appealAmount,
          donationDate,
          donorAccountId,
          designationAccountId,
          motivation,
          memo,
        },
        handleChange,
        handleSubmit,
        isSubmitting,
        isValid,
        errors,
        touched,
      }): ReactElement => (
        <form onSubmit={handleSubmit} noValidate>
          <CreateDonationTitle>
            {t('New Donation')}
            <CloseButton onClick={handleClose}>
              <CloseIcon titleAccess={t('Close')} />
            </CloseButton>
          </CreateDonationTitle>

          <DialogContent dividers>
            <Grid container>
              <Grid container spacing={gridSpacing}>
                <Grid item style={{ width: '67%' }}>
                  <LogFormControl margin="dense" required>
                    <LogFormLabel>{t('Amount')}</LogFormLabel>
                    <TextField
                      type="number"
                      size="small"
                      variant="outlined"
                      value={amount}
                      onChange={handleChange('amount')}
                    />
                  </LogFormControl>
                </Grid>
                <Grid item style={{ width: '33%' }}>
                  <LogFormControl margin="dense" required>
                    <LogFormLabel>{t('Currency')}</LogFormLabel>
                    <TextField
                      select
                      size="small"
                      variant="outlined"
                      value={currency}
                      onChange={handleChange('currency')}
                    >
                      {currencies.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </LogFormControl>
                </Grid>
              </Grid>

              <Grid container spacing={gridSpacing}>
                <Grid item style={{ width: '50%' }}>
                  <LogFormControl margin="dense" required>
                    <LogFormLabel>{t('Date')}</LogFormLabel>
                    <DatePicker
                      format="MM/dd/yyyy"
                      inputVariant="outlined"
                      value={donationDate}
                      onChange={() => handleChange('date')}
                      TextFieldComponent={(props) => (
                        <TextField
                          variant="outlined"
                          size="small"
                          onClick={props.onClick}
                          value={props.value}
                          onChange={props.onChange}
                        />
                      )}
                    />
                  </LogFormControl>
                </Grid>
                <Grid item style={{ width: '50%' }}>
                  <LogFormControl margin="dense">
                    <LogFormLabel>{t('Motivation')}</LogFormLabel>
                    <TextField
                      size="small"
                      variant="outlined"
                      value={motivation}
                      onChange={handleChange('motivation')}
                    />
                  </LogFormControl>
                </Grid>
              </Grid>

              <Grid container spacing={gridSpacing}>
                <Grid item style={{ width: '50%' }}>
                  <LogFormControl margin="dense" required>
                    <LogFormLabel>{t('Partner Account')}</LogFormLabel>
                    <LogButton
                      variant="outlined"
                      onClick={openPartnerAccountModal}
                    >
                      {t('Select Partner Account')}
                    </LogButton>
                  </LogFormControl>
                </Grid>
                <Grid item style={{ width: '50%' }}>
                  <LogFormControl margin="dense" required>
                    <LogFormLabel>{t('Designation Account')}</LogFormLabel>
                    <LogButton
                      variant="outlined"
                      onClick={openDesignationAccountModal}
                    >
                      {t('Select Designation Account')}
                    </LogButton>
                  </LogFormControl>
                </Grid>
              </Grid>

              <Grid container spacing={gridSpacing}>
                <Grid item style={{ width: '33%' }}>
                  <LogFormControl margin="dense">
                    <LogFormLabel>{t('Appeal')}</LogFormLabel>
                    <LogButton variant="outlined" onClick={openAppealModal}>
                      {t('Select Appeal')}
                    </LogButton>
                  </LogFormControl>
                </Grid>
                <Grid item style={{ width: '67%' }}>
                  <LogFormControl margin="dense">
                    <LogFormLabel>{t('Appeal Amount')}</LogFormLabel>
                    <TextField
                      size="small"
                      variant="outlined"
                      value={appealAmount}
                      onChange={handleChange('appealAmount')}
                    />
                  </LogFormControl>
                </Grid>
              </Grid>

              <Grid container spacing={gridSpacing}>
                <Grid item style={{ width: '100%' }}>
                  <LogFormControl>
                    <LogFormLabel>{t('Memo')}</LogFormLabel>
                    <TextField
                      size="small"
                      variant="outlined"
                      value={memo}
                      onChange={handleChange('memo')}
                    />
                  </LogFormControl>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button disabled={isSubmitting} onClick={handleClose}>
              {t('Cancel')}
            </Button>
            <Button
              size="large"
              type="submit"
              variant="contained"
              color="primary"
              disabled={!isValid || isSubmitting}
            >
              {t('Save')}
            </Button>
          </DialogActions>
        </form>
      )}
    </Formik>
  );
};

export default CreateDonationModal;
