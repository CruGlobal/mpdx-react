import { InfoSharp } from '@mui/icons-material';
import { Box, CardContent, TextField, Typography, alpha } from '@mui/material';
import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import theme from 'src/theme';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useSaveField } from '../../Shared/AutoSave/useSaveField';
import { ModalAccordion } from '../ModalAccordion/ModalAccordion';

interface ApprovalProcessProps {
  onForm?: boolean;
}

export const ApprovalProcess: React.FC<ApprovalProcessProps> = ({ onForm }) => {
  const { t } = useTranslation();

  const { errors, touched, values, handleChange, handleBlur, submitCount } =
    useFormikContext<CompleteFormValues>();

  const saveField = useSaveField({ formValues: values });

  const showError =
    (touched.additionalInfo || submitCount > 0) && !!errors.additionalInfo;

  const handleBlurWithSave = (event: React.FocusEvent<HTMLInputElement>) => {
    handleBlur(event);
    saveField({ additionalInfo: values.additionalInfo });
  };

  return (
    <ModalAccordion
      backgroundColor={alpha(theme.palette.info.light, 0.1)}
      icon={InfoSharp}
      title={t('Approval Process')}
      titleColor="info.dark"
      subtitle={t('Approvals needed for this request')}
      expanded={showError}
      onForm={onForm}
    >
      <CardContent>
        <Trans i18nKey="approvalProcessInfo">
          <Typography variant="body1">
            Please explain in detail, what are the specific expenses and reasons
            why you are requesting this salary level and how your ministry
            assignment relates to this need. So that you would not exceed your
            CAP, could this request be spread over 2-3 years?
          </Typography>
        </Trans>
        <Box sx={{ mt: 2 }}>
          <TextField
            name="additionalInfo"
            value={values.additionalInfo}
            onChange={handleChange}
            onBlur={handleBlurWithSave}
            error={showError}
            helperText={showError && errors.additionalInfo}
            multiline
            rows={6}
            fullWidth
            inputProps={{ style: { overflowY: 'auto' } }}
            FormHelperTextProps={{ sx: { ml: 0 } }}
          />
        </Box>
      </CardContent>
    </ModalAccordion>
  );
};
