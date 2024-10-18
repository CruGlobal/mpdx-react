import React, { ReactElement, useState } from 'react';
import {
  Alert,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  DefaultTypeEnum,
  getDefaultFlowOptions,
} from 'src/components/Contacts/ContactFlow/contactFlowDefaultOptions';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
import { ContactFlowOption } from '../../../ContactFlow';

interface ResetToDefaultModalProps {
  updateOptions: (options: ContactFlowOption[]) => Promise<void>;
  handleClose: () => void;
  resetColumnsMessage: string;
}

const MassActionsAddToAppealSchema = yup.object({
  resetToDefaultType: yup.string().required(),
});

export const ResetToDefaultModal: React.FC<ResetToDefaultModalProps> = ({
  handleClose,
  updateOptions,
  resetColumnsMessage,
}) => {
  const { t } = useTranslation();
  const { getContactStatusesByPhase } = useContactPartnershipStatuses();
  const { enqueueSnackbar } = useSnackbar();
  const [updating, setUpdating] = useState(false);

  const handleOnSubmit = async (values: { resetToDefaultType: string }) => {
    const defaultValues = getDefaultFlowOptions(
      t,
      getContactStatusesByPhase,
      values.resetToDefaultType as DefaultTypeEnum,
    );

    await updateOptions(defaultValues);
    enqueueSnackbar(resetColumnsMessage, {
      variant: 'success',
    });
    handleClose();
  };

  return (
    <Modal
      title={t('Reset to Defaults')}
      isOpen={true}
      handleClose={handleClose}
    >
      <Formik
        initialValues={{
          resetToDefaultType: 'US',
        }}
        onSubmit={(values) => {
          setUpdating(true);
          handleOnSubmit(values);
        }}
        validationSchema={MassActionsAddToAppealSchema}
      >
        {({
          values: { resetToDefaultType },
          setFieldValue,
          handleSubmit,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form
            onSubmit={handleSubmit}
            noValidate
            data-testid="CreateAppealModal"
          >
            <DialogContent dividers>
              <FormControl fullWidth>
                <Typography>
                  {t('Pick a default set of columns to use')}
                </Typography>
                <Select
                  name="resetToDefaultType"
                  value={resetToDefaultType}
                  onChange={(e) =>
                    setFieldValue('resetToDefaultType', e.target.value)
                  }
                  style={{
                    width: '100%',
                    marginBottom: '15px',
                  }}
                >
                  <MenuItem key={DefaultTypeEnum.Us} value={DefaultTypeEnum.Us}>
                    {t('Reset columns to US (MPD) defaults')}
                  </MenuItem>
                  <MenuItem value={DefaultTypeEnum.Global}>
                    {t('Reset columns to Global (D MPD) defaults')}
                  </MenuItem>
                </Select>

                <Alert severity="warning" style={{ marginTop: '15px' }}>
                  {t(
                    'Resetting to default will change the columns back to the five phases of MPD. Any customizations you have made will be lost. Are you sure you want to revert to the default columns?',
                  )}
                </Alert>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton disabled={!isValid || isSubmitting}>
                {updating && <CircularProgress color="primary" size={20} />}
                {t('Confirm')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
