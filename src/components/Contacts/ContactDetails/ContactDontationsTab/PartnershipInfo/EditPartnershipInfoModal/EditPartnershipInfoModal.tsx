import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Input,
  InputLabel,
  MenuItem,
  Select,
  styled,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as yup from 'yup';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { useSnackbar } from 'notistack';
import { DateTime } from 'luxon';
import { useAccountListId } from '../../../../../../hooks/useAccountListId';
import Modal from '../../../../../common/Modal/Modal';
import { ContactDonorAccountsFragment } from '../../ContactDonationsTab.generated';
import {
  ContactUpdateInput,
  PledgeFrequencyEnum,
  StatusEnum,
} from '../../../../../../../graphql/types.generated';
import { useApiConstants } from '../../../../../Constants/UseApiConstants';
import { currencyFormat } from '../../../../../../lib/intlFormat';
import { useUpdateContactPartnershipMutation } from './EditPartnershipInfoModal.generated';

const ContactInputWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(0, 6),
  margin: theme.spacing(2, 0),
}));

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

const CheckboxLabel = styled(FormControlLabel)({
  margin: 'none',
});

interface EditPartnershipInfoModalProps {
  contact: ContactDonorAccountsFragment;
  handleClose: () => void;
  isOpen: boolean;
}

export const EditPartnershipInfoModal: React.FC<EditPartnershipInfoModalProps> = ({
  contact,
  handleClose,
  isOpen,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const constants = useApiConstants();

  const { enqueueSnackbar } = useSnackbar();
  const [
    updateContactPartnership,
    { loading: updating },
  ] = useUpdateContactPartnershipMutation();
  const pledgeCurrencies = constants?.pledgeCurrencies;
  const method = contact.lastDonation
    ? contact.lastDonation.paymentMethod
    : t('None');

  const lastGift = contact.lastDonation
    ? `${currencyFormat(
        contact.lastDonation.amount.amount,
        contact.lastDonation.amount.currency,
      )}`
    : '';

  const contactPartnershipSchema: yup.SchemaOf<
    Pick<
      ContactUpdateInput,
      | 'id'
      | 'status'
      | 'pledgeAmount'
      | 'pledgeFrequency'
      | 'pledgeCurrency'
      | 'pledgeReceived'
      | 'pledgeStartDate'
      | 'nextAsk'
      | 'noAppeals'
    >
  > = yup.object({
    id: yup.string().required(),
    status: yup.mixed<StatusEnum>().oneOf(Object.values(StatusEnum)).nullable(),
    pledgeAmount: yup.number().moreThan(-1).nullable(),
    pledgeStartDate: yup.string().nullable(),
    pledgeReceived: yup.boolean().default(false).nullable(),
    pledgeCurrency: yup.string().nullable(),
    nextAsk: yup.string().nullable(),
    noAppeals: yup.boolean().default(false).nullable(),
    pledgeFrequency: yup.mixed<PledgeFrequencyEnum>().nullable(),
  });

  const onSubmit = async (
    attributes: Pick<
      ContactUpdateInput,
      | 'id'
      | 'status'
      | 'pledgeAmount'
      | 'pledgeFrequency'
      | 'pledgeCurrency'
      | 'pledgeReceived'
      | 'pledgeStartDate'
      | 'nextAsk'
      | 'noAppeals'
    >,
  ) => {
    await updateContactPartnership({
      variables: {
        accountListId: accountListId ?? '',
        attributes,
      },
    });

    enqueueSnackbar(t('Partnership information updated successfully.'), {
      variant: 'success',
    });
    handleClose();
  };

  const updateStatus = (
    status: StatusEnum,
    setFieldValue: (name: string, value: StatusEnum | number | null) => void,
  ) => {
    if (status !== StatusEnum.PartnerFinancial) {
      setFieldValue('status', status);
      setFieldValue('pledgeAmount', 0);
      setFieldValue('pledgeFrequency', null);
    } else {
      setFieldValue('status', status);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={t('Edit Partnership')}
      handleClose={handleClose}
    >
      <Formik
        initialValues={{
          id: contact.id,
          status: contact.status,
          pledgeAmount: contact.pledgeAmount,
          pledgeFrequency: contact.pledgeFrequency,
          pledgeReceived: contact.pledgeReceived,
          pledgeCurrency: contact.pledgeCurrency,
          pledgeStartDate: contact.pledgeStartDate,
          nextAsk: contact.nextAsk,
          noAppeals: contact.noAppeals,
        }}
        validationSchema={contactPartnershipSchema}
        onSubmit={onSubmit}
      >
        {({
          values: {
            status,
            pledgeAmount,
            pledgeFrequency,
            pledgeCurrency,
            pledgeReceived,
            pledgeStartDate,
            nextAsk,
            noAppeals,
          },
          handleSubmit,
          handleChange,
          setFieldValue,
          isSubmitting,
          isValid,
          errors,
        }) => (
          <form onSubmit={handleSubmit} noValidate>
            {errors.pledgeFrequency}
            <DialogContent dividers>
              <ContactInputWrapper>
                <FormControl fullWidth>
                  <InputLabel id="status-select-label">
                    {t('Status')}
                  </InputLabel>
                  <Select
                    labelId="status-select-label"
                    value={status}
                    onChange={(e) =>
                      updateStatus(e.target.value as StatusEnum, setFieldValue)
                    }
                  >
                    {Object.values(StatusEnum).map((value) => (
                      <MenuItem key={value} value={value}>
                        {t(value)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ContactInputWrapper>
              <ContactInputWrapper>
                <FormControl fullWidth>
                  <InputLabel>{t('Amount')}</InputLabel>
                  <Input
                    value={pledgeAmount}
                    type="number"
                    disabled={status !== StatusEnum.PartnerFinancial}
                    aria-readonly={status !== StatusEnum.PartnerFinancial}
                    onChange={handleChange('pledgeAmount')}
                    inputProps={{ 'aria-label': t('Amount') }}
                    endAdornment={
                      <Tooltip
                        title={
                          <Typography>
                            {t(
                              'Commitments can only be set if status is Partner - Financial',
                            )}
                          </Typography>
                        }
                      >
                        <InfoIcon />
                      </Tooltip>
                    }
                    fullWidth
                  />
                </FormControl>
              </ContactInputWrapper>
              <ContactInputWrapper>
                <FormControl fullWidth>
                  <InputLabel id="currency-select-label">
                    {t('Currency')}
                  </InputLabel>
                  <Select
                    labelId="currency-select-label"
                    value={pledgeCurrency}
                    onChange={handleChange('pledgeCurrency')}
                    MenuProps={{
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                      },
                      getContentAnchorEl: null,
                      PaperProps: {
                        style: {
                          maxHeight: '300px',
                          overflow: 'auto',
                        },
                      },
                    }}
                  >
                    {pledgeCurrencies?.map(
                      ({ value, id }) =>
                        value &&
                        id && (
                          <MenuItem key={id} value={id}>
                            {t(value)}
                          </MenuItem>
                        ),
                    )}
                  </Select>
                </FormControl>
              </ContactInputWrapper>
              <ContactInputWrapper>
                <FormControl fullWidth>
                  <InputLabel id="frequency-select-label">
                    {t('Frequency')}
                  </InputLabel>
                  <Select
                    labelId="frequency-select-label"
                    value={pledgeFrequency}
                    disabled={status !== StatusEnum.PartnerFinancial}
                    aria-readonly={status !== StatusEnum.PartnerFinancial}
                    onChange={handleChange('pledgeFrequency')}
                    IconComponent={() =>
                      status !== StatusEnum.PartnerFinancial ? (
                        <Tooltip
                          title={
                            <Typography>
                              {t(
                                'Commitments can only be set if status is Partner - Financial',
                              )}
                            </Typography>
                          }
                        >
                          <InfoIcon />
                        </Tooltip>
                      ) : (
                        <ArrowDropDownIcon />
                      )
                    }
                  >
                    {Object.values(PledgeFrequencyEnum).map((value) => (
                      <MenuItem key={value} value={value}>
                        {t(value)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ContactInputWrapper>
              <ContactInputWrapper>
                <KeyboardDatePicker
                  onChange={(date): void =>
                    setFieldValue('pledgeStartDate', date)
                  }
                  value={
                    pledgeStartDate
                      ? DateTime.fromISO(pledgeStartDate).toLocaleString()
                      : null
                  }
                  format="MM/dd/yyyy"
                  clearable
                  label={t('Start Date')}
                  inputProps={{ 'aria-label': t('Start Date') }}
                  fullWidth
                  KeyboardButtonProps={{
                    'aria-label': 'change start date',
                  }}
                />
              </ContactInputWrapper>
              <ContactInputWrapper>
                <KeyboardDatePicker
                  onChange={(date) =>
                    !date ? null : setFieldValue('nextAsk', date)
                  }
                  value={
                    nextAsk ? DateTime.fromISO(nextAsk).toLocaleString() : null
                  }
                  format="MM/dd/yyyy"
                  clearable
                  label={t('Next Ask Increase')}
                  inputProps={{ 'aria-label': t('Next Ask Increase') }}
                  fullWidth
                  KeyboardButtonProps={{
                    'aria-label': 'change next ask date',
                  }}
                />
              </ContactInputWrapper>
              <ContactInputWrapper>
                <CheckboxLabel
                  control={
                    <Checkbox
                      checked={pledgeReceived}
                      onChange={() =>
                        setFieldValue('pledgeReceived', !pledgeReceived)
                      }
                    />
                  }
                  label={t('Commitment Recieved')}
                />
              </ContactInputWrapper>
              <ContactInputWrapper>
                <CheckboxLabel
                  control={
                    <Checkbox
                      checked={!noAppeals}
                      onChange={() => setFieldValue('noAppeals', !noAppeals)}
                    />
                  }
                  label={t('Send Appeals')}
                />
              </ContactInputWrapper>
              <ContactInputWrapper>
                <FormControl fullWidth>
                  <TextField
                    label={t('Method')}
                    value={method}
                    aria-readonly
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      'aria-label': t('Method'),
                    }}
                  />
                </FormControl>
              </ContactInputWrapper>
              <ContactInputWrapper>
                <FormControl fullWidth>
                  <TextField
                    label={t('Last Gift')}
                    value={lastGift}
                    aria-readonly
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      'aria-label': t('Last Gift'),
                    }}
                  />
                </FormControl>
              </ContactInputWrapper>
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
                variant="text"
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
