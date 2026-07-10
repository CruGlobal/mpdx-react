import React, { useEffect, useMemo, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { CurrencyAdornment } from 'src/components/HrTools/Shared/Adornments';
import { TrainingCosts } from '../mpdGoalAdminHelpers';

type FieldName = keyof TrainingCosts;

/**
 * The 11 cost fields as held by Formik. Empty inputs are `''`; because these
 * are `type="number"` inputs, Formik's `handleChange` coerces entered text to
 * a `number`, so a populated field is a `number`.
 */
type FormValues = Record<FieldName, number | ''>;

interface FieldConfig {
  name: FieldName;
  label: string;
  /** Responsive column span for this field within its section row. */
  size: Record<string, number>;
}

interface SectionConfig {
  title: string;
  fields: FieldConfig[];
}

export interface EditTrainingCostsModalProps {
  open: boolean;
  /** Name of the cohort being edited, shown in the title. */
  cohortName?: string;
  /** Existing costs to prefill; undefined starts every field blank. */
  initialCosts?: TrainingCosts;
  onClose: () => void;
  /** Persists the entered costs. May be async (e.g. a mutation). */
  onSave: (costs: TrainingCosts) => void | Promise<void>;
}

const FIELD_NAMES: FieldName[] = [
  'nsoIbsIndividual1InRoom',
  'nsoIbsIndividual2InRoom',
  'nsoIbsCouple',
  'nsoIbsFamily',
  'refreshRetreatSingle',
  'refreshRetreatCouple',
  'faithAndFinanceSingle',
  'faithAndFinanceCouple',
  'cruConferenceSingle',
  'cruConferenceCouple',
  'cruConferenceFamily',
];

const blankValues = (): FormValues =>
  FIELD_NAMES.reduce((acc, name) => {
    acc[name] = '';
    return acc;
  }, {} as FormValues);

const toFormValues = (costs?: TrainingCosts): FormValues => {
  if (!costs) {
    return blankValues();
  }
  return FIELD_NAMES.reduce((acc, name) => {
    acc[name] = costs[name];
    return acc;
  }, {} as FormValues);
};

const toTrainingCosts = (values: FormValues): TrainingCosts =>
  FIELD_NAMES.reduce((acc, name) => {
    acc[name] = Number(values[name]);
    return acc;
  }, {} as TrainingCosts);

const titleId = 'edit-training-costs-title';

export const EditTrainingCostsModal: React.FC<EditTrainingCostsModalProps> = ({
  open,
  cohortName,
  initialCosts,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const formikRef = useRef<FormikProps<FormValues>>(null);

  const sections = useMemo<SectionConfig[]>(
    () => [
      {
        title: t('NSO & IBS Cost'),
        fields: [
          {
            name: 'nsoIbsIndividual1InRoom',
            label: t('Individual (1 in room)'),
            size: { xs: 12, sm: 6, md: 3 },
          },
          {
            name: 'nsoIbsIndividual2InRoom',
            label: t('Individual (2 in room)'),
            size: { xs: 12, sm: 6, md: 3 },
          },
          {
            name: 'nsoIbsCouple',
            label: t('Couple'),
            size: { xs: 12, sm: 6, md: 3 },
          },
          {
            name: 'nsoIbsFamily',
            label: t('Family'),
            size: { xs: 12, sm: 6, md: 3 },
          },
        ],
      },
      {
        title: t('Refresh Retreat'),
        fields: [
          {
            name: 'refreshRetreatSingle',
            label: t('Single'),
            size: { xs: 12, sm: 6 },
          },
          {
            name: 'refreshRetreatCouple',
            label: t('Couple'),
            size: { xs: 12, sm: 6 },
          },
        ],
      },
      {
        title: t('Faith and Finance'),
        fields: [
          {
            name: 'faithAndFinanceSingle',
            label: t('Single'),
            size: { xs: 12, sm: 6 },
          },
          {
            name: 'faithAndFinanceCouple',
            label: t('Couple'),
            size: { xs: 12, sm: 6 },
          },
        ],
      },
      {
        title: t('Cru Conference'),
        fields: [
          {
            name: 'cruConferenceSingle',
            label: t('Single'),
            size: { xs: 12, sm: 4 },
          },
          {
            name: 'cruConferenceCouple',
            label: t('Couple'),
            size: { xs: 12, sm: 4 },
          },
          {
            name: 'cruConferenceFamily',
            label: t('Family'),
            size: { xs: 12, sm: 4 },
          },
        ],
      },
    ],
    [t],
  );

  const validationSchema = useMemo(() => {
    const amount = yup
      .number()
      .transform((value, originalValue) =>
        String(originalValue).trim() === '' ? undefined : value,
      )
      .typeError(t('Enter a valid amount'))
      .min(0, t('Amount must be 0 or more'))
      .required(t('Required'));

    return yup.object(
      FIELD_NAMES.reduce(
        (shape, name) => {
          shape[name] = amount;
          return shape;
        },
        {} as Record<FieldName, yup.NumberSchema>,
      ),
    );
  }, [t]);

  const initialValues = useMemo(
    () => toFormValues(initialCosts),
    [initialCosts],
  );

  // Reset the form each time the modal reopens so a cancelled edit does not
  // linger into the next open (matches the CreateGoalDialog pattern). Reset to
  // the current cohort's `initialValues` rather than Formik's mount-time ref
  // (which never updates without `enableReinitialize`) so saved costs prefill.
  useEffect(() => {
    if (open) {
      formikRef.current?.resetForm({ values: initialValues });
    }
  }, [open, initialValues]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby={titleId}
    >
      <DialogTitle component="div">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography id={titleId} variant="h5" component="h2">
            {cohortName
              ? t('Training Costs for {{name}}', { name: cohortName })
              : t('Training Costs')}
          </Typography>
          <IconButton aria-label={t('Close')} onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          {t(
            'Please enter the cost details that apply to this training. All fields are required.',
          )}
        </Typography>
      </DialogTitle>
      <Formik<FormValues>
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          await onSave(toTrainingCosts(values));
        }}
      >
        {({
          values,
          errors,
          touched,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => {
          // Apply stays disabled until every required field holds a valid
          // value. Deriving this from the values/errors (rather than Formik's
          // `isValid` + `validateOnMount`, which the reset-on-open effect below
          // clears back to valid at mount) keeps the button disabled from the
          // first render.
          const canApply =
            FIELD_NAMES.every((name) => values[name] !== '') &&
            Object.keys(errors).length === 0;

          return (
            <form onSubmit={handleSubmit}>
              <DialogContent dividers>
                {sections.map((section, index) => {
                  const sectionId = `training-costs-section-${index}`;
                  return (
                    <Box key={section.title} sx={{ mt: index > 0 ? 3 : 0 }}>
                      {index > 0 && <Divider sx={{ mb: 3 }} />}
                      <Typography
                        id={sectionId}
                        component="h3"
                        variant="h6"
                        gutterBottom
                      >
                        {section.title}
                      </Typography>
                      <Grid
                        container
                        spacing={3}
                        role="group"
                        aria-labelledby={sectionId}
                      >
                        {section.fields.map((field) => (
                          <Grid key={field.name} size={field.size}>
                            <TextField
                              name={field.name}
                              label={field.label}
                              value={values[field.name]}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              type="number"
                              fullWidth
                              size="small"
                              required
                              error={
                                touched[field.name] &&
                                Boolean(errors[field.name])
                              }
                              helperText={
                                touched[field.name] && errors[field.name]
                              }
                              inputProps={{ min: 0, step: 0.01 }}
                              InputProps={{
                                startAdornment: <CurrencyAdornment />,
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  );
                })}
              </DialogContent>
              <DialogActions>
                <Button onClick={onClose}>{t('Cancel')}</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!canApply || isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : null
                  }
                >
                  {t('Apply')}
                </Button>
              </DialogActions>
            </form>
          );
        }}
      </Formik>
    </Dialog>
  );
};
