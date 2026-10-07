import React, { useEffect, useMemo, useRef } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  RadioGroup,
  SxProps,
  Theme,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { DescribedRadioOption } from 'src/components/HrTools/Shared/DescribedRadioOption';
import { DesignationSupportFormType } from 'src/graphql/types.generated';

export interface CreateGoalDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (formType: DesignationSupportFormType) => Promise<void>;
}

interface FormValues {
  formType: DesignationSupportFormType | '';
}

const schema = yup.object({
  formType: yup
    .string()
    .oneOf(Object.values(DesignationSupportFormType))
    .required(),
});

export const CreateGoalDialog: React.FC<CreateGoalDialogProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const { t } = useTranslation();
  const formikRef = useRef<FormikProps<FormValues>>(null);

  useEffect(() => {
    if (open) {
      formikRef.current?.resetForm();
    }
  }, [open]);

  const formTypeOptions = useMemo<
    Array<{
      value: DesignationSupportFormType;
      title: string;
      description: string;
    }>
  >(
    () => [
      {
        value: DesignationSupportFormType.Detailed,
        title: t('Default'),
        description: t(
          'Full calculator with reimbursable expenses and 403b contributions.',
        ),
      },
      {
        value: DesignationSupportFormType.Simple,
        title: t('Simple'),
        description: t(
          'Streamlined calculator without reimbursable expenses or 403b contributions.',
        ),
      },
    ],
    [t],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="create-goal-dialog-title"
    >
      <DialogTitle id="create-goal-dialog-title">
        {t('Create a New Goal')}
      </DialogTitle>
      <Formik<FormValues>
        innerRef={formikRef}
        initialValues={{ formType: '' }}
        validationSchema={schema}
        onSubmit={async ({ formType }) => {
          if (formType) {
            await onCreate(formType);
          }
        }}
      >
        {({ values, isSubmitting, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <FormControl component="fieldset">
                <FormLabel sx={visuallyHidden as SxProps<Theme>}>
                  {t('Select a form type')}
                </FormLabel>
                <RadioGroup
                  name="formType"
                  value={values.formType}
                  onChange={handleChange}
                  sx={{ gap: 2 }}
                >
                  {formTypeOptions.map(({ value, title, description }) => (
                    <DescribedRadioOption
                      key={value}
                      value={value}
                      label={title}
                      description={description}
                      labelVariant="subtitle1"
                      descriptionVariant="body2"
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>{t('Cancel')}</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!values.formType || isSubmitting}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
              >
                {t('Create')}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
};
