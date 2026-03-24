import { InfoSharp } from '@mui/icons-material';
import { Box, CardContent, Typography, alpha } from '@mui/material';
import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import theme from 'src/theme';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { AutosaveCustomTextField } from '../../Shared/AutoSave/AutosaveCustomTextField';
import { ModalAccordion } from '../ModalAccordion/ModalAccordion';

interface ApprovalProcessProps {
  onForm?: boolean;
  exceedsCap?: boolean;
}

export const ApprovalProcess: React.FC<ApprovalProcessProps> = ({
  onForm,
  exceedsCap = true,
}) => {
  const { t } = useTranslation();

  const { errors, touched, submitCount } =
    useFormikContext<CompleteFormValues>();

  const showError =
    (touched.additionalInfo || submitCount > 0) && !!errors.additionalInfo;

  return (
    <ModalAccordion
      backgroundColor={alpha(theme.palette.info.light, 0.1)}
      icon={InfoSharp}
      title={exceedsCap ? t('Approval Process') : t('Optional Comments')}
      titleColor="info.dark"
      subtitle={
        exceedsCap
          ? t('Approvals needed for this request')
          : t(
              'Use this optional comment section to communicate specific payroll needs, if needed.',
            )
      }
      expanded={showError}
      onForm={onForm}
    >
      <CardContent>
        {exceedsCap ? (
          <Trans i18nKey="approvalProcessInfo">
            <Typography variant="body1">
              Please explain in detail, what are the specific expenses and
              reasons why you are requesting this salary level and how your
              ministry assignment relates to this need. So that you would not
              exceed your CAP, could this request be spread over 2-3 years?
            </Typography>
          </Trans>
        ) : (
          <Typography variant="body1">
            {t(
              'Use this optional comment section to communicate specific payroll needs, if needed.',
            )}
          </Typography>
        )}
        <Box sx={{ mt: 2 }}>
          <AutosaveCustomTextField
            fieldName="additionalInfo"
            variant="outlined"
            multiline
            rows={6}
            fullWidth
            inputProps={{ style: { overflowY: 'auto' } }}
          />
        </Box>
      </CardContent>
    </ModalAccordion>
  );
};
