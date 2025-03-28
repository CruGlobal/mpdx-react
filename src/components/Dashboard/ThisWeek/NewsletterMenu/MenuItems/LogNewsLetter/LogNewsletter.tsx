import React, { ReactElement, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { DateTimeFieldPair } from 'src/components/common/DateTimePickers/DateTimeFieldPair';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { ActivityTypeEnum } from 'src/graphql/types.generated';
import { nullableDateTime } from 'src/lib/formikHelpers';
import { useCreateTasksMutation } from '../../../../../Task/Modal/Form/TaskModal.generated';

interface Props {
  accountListId: string;
  handleClose: () => void;
}

const LogNewsletterTitle = styled(DialogTitle)(() => ({
  textTransform: 'uppercase',
  textAlign: 'center',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.mpdxGrayLight.main,
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

const LogFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  '& span.MuiFormControlLabel-label': {
    fontWeight: 'bold',
    color: theme.palette.primary.dark,
  },
}));

const LogTextField = styled(TextField)(({ theme }) => ({
  '& div': {
    padding: theme.spacing(1),
  },
}));

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

const taskSchema = yup.object({
  activityType: yup
    .mixed<ActivityTypeEnum | 'BOTH'>()
    .oneOf([...Object.values(ActivityTypeEnum), 'BOTH' as const])
    .defined(),
  completedAt: nullableDateTime(),
  subject: yup.string().required(),
});

type Attributes = yup.InferType<typeof taskSchema>;

const LogNewsletter = ({
  accountListId,
  handleClose,
}: Props): ReactElement<Props> => {
  const { t } = useTranslation();

  const [commentBody, changeCommentBody] = useState('');

  const [createTasks, { loading: creating }] = useCreateTasksMutation();

  const initialTask = {
    activityType: ActivityTypeEnum.PartnerCarePhysicalNewsletter,
    completedAt: null,
    subject: '',
  };

  const onSubmit = async (attributes: Attributes) => {
    const body = commentBody.trim();

    // Create two tasks when the activity type is both
    const taskTypes =
      attributes.activityType === 'BOTH'
        ? [
            ActivityTypeEnum.PartnerCarePhysicalNewsletter,
            ActivityTypeEnum.PartnerCareDigitalNewsletter,
          ]
        : [attributes.activityType];
    await Promise.all(
      taskTypes.map((activityType) =>
        createTasks({
          variables: {
            accountListId,
            attributes: {
              ...attributes,
              activityType,
              completedAt: attributes.completedAt?.toISO(),
              startAt: DateTime.local().toISO(),
              comment: body.length > 1 ? body : undefined,
            },
          },
        }),
      ),
    );

    enqueueSnackbar(t('Newsletter logged successfully'), {
      variant: 'success',
    });
    handleClose();
  };

  const { enqueueSnackbar } = useSnackbar();
  return (
    <Formik
      initialValues={initialTask}
      validationSchema={taskSchema}
      validateOnMount
      onSubmit={onSubmit}
    >
      {({
        values: { activityType, subject, completedAt },
        setFieldValue,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        isValid,
        errors,
        touched,
      }): ReactElement => (
        <form onSubmit={handleSubmit} noValidate>
          <LogNewsletterTitle>
            {t('Log Newsletter')}
            <CloseButton onClick={handleClose} aria-label={t('Close')}>
              <CloseIcon />
            </CloseButton>
          </LogNewsletterTitle>
          <DialogContent dividers>
            <Grid container>
              <Grid item xs={12}>
                <LogFormControl>
                  <LogFormLabel required>{t('Subject')}</LogFormLabel>
                  <LogTextField
                    name="subject"
                    value={subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    multiline
                    inputProps={{ 'aria-label': t('Subject') }}
                    error={!!errors.subject && touched.subject}
                    helperText={
                      errors.subject &&
                      touched.subject &&
                      t('Field is required')
                    }
                    variant="outlined"
                    required
                  />
                </LogFormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl>
                  <LogFormLabel required>{t('Action')}</LogFormLabel>
                  <RadioGroup
                    name="action"
                    onChange={handleChange('activityType')}
                    value={activityType}
                  >
                    <LogFormControlLabel
                      value={ActivityTypeEnum.PartnerCarePhysicalNewsletter}
                      control={<Radio color="secondary" />}
                      label={t('Physical Newsletter')}
                    />
                    <LogFormControlLabel
                      value={ActivityTypeEnum.PartnerCareDigitalNewsletter}
                      control={<Radio color="secondary" />}
                      label={t('Digital Newsletter')}
                    />
                    <LogFormControlLabel
                      value="BOTH"
                      control={<Radio color="secondary" />}
                      label={t('Both')}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <LogFormControl>
                <LogFormLabel>{t('Completed On')}</LogFormLabel>
                <Grid item xs={12}>
                  <DateTimeFieldPair
                    dateLabel={t('Completed Date')}
                    timeLabel={t('Completed Time')}
                    value={completedAt}
                    onChange={(date) => setFieldValue('completedAt', date)}
                    render={(dateField, timeField) => (
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          {dateField}
                        </Grid>
                        <Grid item xs={12} md={6}>
                          {timeField}
                        </Grid>
                      </Grid>
                    )}
                  />
                </Grid>
              </LogFormControl>
              <Grid item xs={12}>
                <LogFormControl>
                  <LogFormLabel>{t('Comment')}</LogFormLabel>
                  <LogTextField
                    value={commentBody}
                    onChange={(event) => changeCommentBody(event.target.value)}
                    fullWidth
                    multiline
                    inputProps={{ 'aria-label': t('Comment') }}
                    variant="outlined"
                  />
                </LogFormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <CancelButton disabled={isSubmitting} onClick={handleClose} />
            <SubmitButton disabled={!isValid || isSubmitting}>
              {creating && <LoadingIndicator color="primary" size={20} />}
              {t('Save')}
            </SubmitButton>
          </DialogActions>
        </form>
      )}
    </Formik>
  );
};

export default LogNewsletter;
