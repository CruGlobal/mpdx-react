import React, { ReactElement, useState } from 'react';
import {
  DialogTitle,
  DialogActions,
  DialogContent,
  IconButton,
  FormControl,
  TextField,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import * as yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import ClockIcon from '@mui/icons-material/AccessTime';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { ActivityTypeEnum } from '../../../../../../../graphql/types.generated';

import { useCreateTasksMutation } from '../../../../../Task/Modal/Form/TaskModal.generated';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { getDateFormatPattern } from 'src/lib/intlFormat/intlFormat';
import { useLocale } from 'src/hooks/useLocale';

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
    backgroundColor: theme.palette.cruGrayLight.main,
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
    .mixed()
    .oneOf([...Object.values(ActivityTypeEnum), 'BOTH' as const])
    .defined(),
  completedAt: yup.string().nullable(),
  subject: yup.string().required(),
});

const LogNewsletter = ({
  accountListId,
  handleClose,
}: Props): ReactElement<Props> => {
  const { t } = useTranslation();
  const locale = useLocale();

  const [commentBody, changeCommentBody] = useState('');

  const [createTasks, { loading: creating }] = useCreateTasksMutation();

  const initialTask: yup.InferType<typeof taskSchema> = {
    activityType: ActivityTypeEnum.NewsletterPhysical,
    completedAt: null,
    subject: '',
  };

  const onSubmit = async (attributes: yup.InferType<typeof taskSchema>) => {
    const body = commentBody.trim();

    // Create two tasks when the activity type is both
    const taskTypes =
      attributes.activityType === 'BOTH'
        ? [
            ActivityTypeEnum.NewsletterPhysical,
            ActivityTypeEnum.NewsletterEmail,
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
      onSubmit={onSubmit}
    >
      {({
        values: { activityType, subject, completedAt },
        setFieldValue,
        handleChange,
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
                    value={subject}
                    onChange={handleChange('subject')}
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
                      value={ActivityTypeEnum.NewsletterPhysical}
                      control={<Radio color="secondary" required />}
                      label={t('Newsletter - Physical')}
                    />
                    <LogFormControlLabel
                      value={ActivityTypeEnum.NewsletterEmail}
                      control={<Radio color="secondary" required />}
                      label={t('Newsletter - Email')}
                    />
                    <LogFormControlLabel
                      value="BOTH"
                      control={<Radio color="secondary" required />}
                      label={t('Both')}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <LogFormControl>
                <LogFormLabel>{t('Completed On')}</LogFormLabel>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <MobileDatePicker
                        renderInput={(params) => (
                          <TextField fullWidth {...params} />
                        )}
                        value={completedAt}
                        onChange={(date): void =>
                          setFieldValue('completedAt', date)
                        }
                        inputFormat={getDateFormatPattern(locale)}
                        closeOnSelect
                        label={t('Completed Date')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconButton>
                                <CalendarIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MobileTimePicker
                        renderInput={(params) => (
                          <TextField fullWidth {...params} />
                        )}
                        value={completedAt}
                        onChange={(date): void =>
                          setFieldValue('completedAt', date)
                        }
                        closeOnSelect
                        label={t('Completed Time')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconButton>
                                <ClockIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
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
