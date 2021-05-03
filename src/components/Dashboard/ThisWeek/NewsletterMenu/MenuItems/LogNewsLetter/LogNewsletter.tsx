import React, { ReactElement, useState } from 'react';
import {
  DialogTitle,
  DialogActions,
  DialogContent,
  IconButton,
  styled,
  FormControl,
  TextField,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  InputAdornment,
  Button,
  CircularProgress,
} from '@material-ui/core';
import * as yup from 'yup';
import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import { DatePicker, TimePicker } from '@material-ui/pickers';
import ClockIcon from '@material-ui/icons/AccessTime';
import CalendarIcon from '@material-ui/icons/CalendarToday';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { v4 as uuidv4 } from 'uuid';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  TaskCreateInput,
} from '../../../../../../../graphql/types.generated';

import { useCreateTaskMutation } from '../../../../../Task/Drawer/Form/TaskDrawer.generated';
import { useCreateTaskCommentMutation } from '../../../../../Task/Drawer/CommentList/Form/CreateTaskComment.generated';

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

const taskSchema: yup.SchemaOf<
  Omit<TaskCreateInput, 'result' | 'nextAction'>
> = yup.object({
  id: yup.string().nullable(),
  activityType: yup.mixed<ActivityTypeEnum>(),
  subject: yup.string().required(),
  startAt: yup.string().nullable(),
  completedAt: yup.string().nullable(),
  tagList: yup.array().of(yup.string()).default([]),
  contactIds: yup.array().of(yup.string()).default([]),
  userId: yup.string().nullable(),
  notificationTimeBefore: yup.number().nullable(),
  notificationType: yup.mixed<NotificationTypeEnum>(),
  notificationTimeUnit: yup.mixed<NotificationTimeUnitEnum>(),
});

const LogNewsletter = ({
  accountListId,
  handleClose,
}: Props): ReactElement<Props> => {
  const { t } = useTranslation();

  const [commentBody, changeCommentBody] = useState('');

  const [createTask, { loading: creating }] = useCreateTaskMutation();
  const [createTaskComment] = useCreateTaskCommentMutation();

  const initialTask: TaskCreateInput = {
    activityType: ActivityTypeEnum.NewsletterPhysical,
    completedAt: null,
    contactIds: [],
    id: null,
    nextAction: null,
    notificationTimeBefore: null,
    notificationTimeUnit: null,
    notificationType: null,
    result: null,
    startAt: DateTime.local().plus({ hours: 1 }).startOf('hour').toISO(),
    subject: '',
    tagList: [],
    userId: null,
  };

  const onSubmit = async (attributes: TaskCreateInput) => {
    const body = commentBody.trim();
    try {
      await createTask({
        variables: {
          accountListId,
          attributes,
        },
        update: (_cache, { data }) => {
          if (data?.createTask?.task.id && body !== '') {
            const id = uuidv4();
            try {
              createTaskComment({
                variables: {
                  accountListId,
                  taskId: data.createTask.task.id,
                  attributes: { id, body },
                },
              });
            } catch (error) {
              enqueueSnackbar(error.message, { variant: 'error' });
              throw error;
            }
          }
        },
      });
      enqueueSnackbar(t('Task saved successfully'), { variant: 'success' });
      handleClose();
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
      throw error;
    }
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
            <CloseButton onClick={handleClose}>
              <CloseIcon titleAccess={t('Close')} />
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
                    inputProps={{ 'aria-label': 'Subject' }}
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
                      control={<Radio required />}
                      label={t('Newsletter - Physical')}
                    />
                    <LogFormControlLabel
                      value={ActivityTypeEnum.NewsletterEmail}
                      control={<Radio required />}
                      label={t('Newsletter - Email')}
                    />
                    {/* TODO: Add Both option once BOTH is added to ActivityTypeEnum type */}
                    {/* <LogFormControlLabel
                      value="both"
                      control={<Radio />}
                      label={t('Both')}
                    /> */}
                  </RadioGroup>
                </FormControl>
              </Grid>
              <LogFormControl>
                <LogFormLabel>{t('Completed On')}</LogFormLabel>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <DatePicker
                        value={completedAt}
                        onChange={(date): void =>
                          setFieldValue('completedAt', date)
                        }
                        format="MM/dd/yyyy"
                        clearable
                        fullWidth
                        autoOk
                        data-testid="completedDate"
                        inputVariant="outlined"
                        label={t('Completed Date')}
                        okLabel={t('OK')}
                        todayLabel={t('Today')}
                        cancelLabel={t('Cancel')}
                        clearLabel={t('Clear')}
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
                    <Grid item xs={6}>
                      <TimePicker
                        value={completedAt}
                        onChange={(date): void =>
                          setFieldValue('completedAt', date)
                        }
                        clearable
                        fullWidth
                        autoOk
                        data-testid="completedTime"
                        inputVariant="outlined"
                        label={t('Completed Time')}
                        okLabel={t('OK')}
                        todayLabel={t('Today')}
                        cancelLabel={t('Cancel')}
                        clearLabel={t('Clear')}
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
                    inputProps={{ 'aria-label': 'Comment' }}
                    variant="outlined"
                  />
                </LogFormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button disabled={isSubmitting} onClick={handleClose}>
              {t('Cancel')}
            </Button>
            <Button
              size="large"
              variant="contained"
              color="primary"
              disabled={!isValid || isSubmitting}
              type="submit"
            >
              {creating && <LoadingIndicator color="primary" size={20} />}
              {t('Save')}
            </Button>
          </DialogActions>
        </form>
      )}
    </Formik>
  );
};

export default LogNewsletter;
