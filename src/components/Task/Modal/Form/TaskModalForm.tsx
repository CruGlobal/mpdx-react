import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import CalendarToday from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import Schedule from '@mui/icons-material/Schedule';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Formik } from 'formik';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { NullableSelect } from 'src/components/NullableSelect/NullableSelect';
import {
  CancelButton,
  DeleteButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { DeleteConfirmation } from 'src/components/common/Modal/DeleteConfirmation/DeleteConfirmation';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  ResultEnum,
  TaskCreateInput,
  TaskUpdateInput,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import useTaskModal from 'src/hooks/useTaskModal';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';
import { getDateFormatPattern } from 'src/lib/intlFormat/intlFormat';
import {
  getLocalizedNotificationTimeUnit,
  getLocalizedNotificationType,
} from 'src/utils/functions/getLocalizedNotificationStrings';
import { getLocalizedResultString } from 'src/utils/functions/getLocalizedResultStrings';
import theme from '../../../../theme';
import { GetTaskForTaskModalQuery } from '../TaskModalTask.generated';
import { FormFieldsGridContainer } from './Container/FormFieldsGridContainer';
import { ActivityTypeAutocomplete } from './Inputs/ActivityTypeAutocomplete/ActivityTypeAutocomplete';
import { AssigneeAutocomplete } from './Inputs/ActivityTypeAutocomplete/AssigneeAutocomplete/AssigneeAutocomplete';
import { ContactsAutocomplete } from './Inputs/ContactsAutocomplete/ContactsAutocomplete';
import {
  TagTypeEnum,
  TagsAutocomplete,
} from './Inputs/TagsAutocomplete/TagsAutocomplete';
import { possibleNextActions } from './PossibleNextActions';
import { possibleResults } from './PossibleResults';
import {
  useCreateTasksMutation,
  useUpdateTaskMutation,
} from './TaskModal.generated';

const taskSchema = yup.object({
  id: yup.string().nullable(),
  activityType: yup.mixed<ActivityTypeEnum>().nullable(),
  subject: yup.string().required(),
  startAt: yup.string().nullable(),
  completedAt: yup.string().nullable(),
  result: yup.mixed<ResultEnum>().nullable(),
  nextAction: yup.mixed<ActivityTypeEnum>().nullable(),
  tagList: yup.array().of(yup.string().required()).default([]),
  contactIds: yup.array().of(yup.string().required()).default([]),
  userId: yup.string().nullable(),
  notificationTimeBefore: yup.number().nullable(),
  notificationType: yup.mixed<NotificationTypeEnum>().nullable(),
  notificationTimeUnit: yup.mixed<NotificationTimeUnitEnum>().nullable(),
  // These field schemas should ideally be string().defined(), but Formik thinks the form is invalid
  // when those fields fields are blank for some reason, and we need to allow blank values
  location: yup.string(),
  comment: yup.string(),
});
type Attributes = yup.InferType<typeof taskSchema>;

interface Props {
  accountListId: string;
  task?: GetTaskForTaskModalQuery['task'] | null;
  onClose: () => void;
  defaultValues?: Partial<TaskCreateInput & TaskUpdateInput>;
  view?: 'comments' | 'log' | 'add' | 'complete' | 'edit';
}

const TaskModalForm = ({
  accountListId,
  task,
  onClose,
  defaultValues,
  view,
}: Props): ReactElement => {
  const initialTask: Attributes = useMemo(
    () =>
      task
        ? {
            id: task.id,
            activityType: task.activityType ?? null,
            location: task.location ?? '',
            subject: task.subject ?? '',
            startAt: task.startAt ?? null,
            completedAt: task.completedAt ?? null,
            result: task.result ?? null,
            nextAction: task.nextAction ?? null,
            tagList: task.tagList ?? [],
            contactIds: task.contacts.nodes.map(({ id }) => id),
            userId: task.user?.id ?? null,
            notificationTimeBefore: task.notificationTimeBefore,
            notificationType: task.notificationType,
            notificationTimeUnit: task.notificationTimeUnit,
            comment: '',
          }
        : {
            id: null,
            activityType: defaultValues?.activityType ?? null,
            location: '',
            subject: defaultValues?.subject ?? '',
            startAt: DateTime.local().toISO(),
            completedAt: null,
            result: defaultValues?.result ?? null,
            nextAction: defaultValues?.nextAction ?? null,
            tagList: defaultValues?.tagList ?? [],
            contactIds: defaultValues?.contactIds ?? [],
            userId: defaultValues?.userId ?? null,
            notificationTimeBefore: null,
            notificationType: null,
            notificationTimeUnit: null,
            comment: '',
          },
    [],
  );

  const { t } = useTranslation();
  const locale = useLocale();
  const { openTaskModal } = useTaskModal();
  const [removeDialogOpen, handleRemoveDialog] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [createTasks, { loading: creating }] = useCreateTasksMutation();
  const [updateTask, { loading: saving }] = useUpdateTaskMutation();
  const { update } = useUpdateTasksQueries();

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const availableResults = task?.activityType
    ? possibleResults(task.activityType)
    : [];
  const availableNextActions = task?.activityType
    ? possibleNextActions(task.activityType)
    : [];

  const onSubmit = async (attributes: Attributes): Promise<void> => {
    const { id, comment, ...sharedAttributes } = attributes;
    if (id) {
      await updateTask({
        variables: {
          accountListId,
          attributes: { ...sharedAttributes, id },
        },
        refetchQueries: ['ContactTasksTab', 'GetWeeklyActivity', 'GetThisWeek'],
      });
    } else {
      await createTasks({
        variables: {
          accountListId,
          attributes: { ...sharedAttributes, comment: comment?.trim() },
        },
        refetchQueries: ['ContactTasksTab', 'GetWeeklyActivity', 'GetThisWeek'],
      });
    }
    update();
    enqueueSnackbar(t('Task(s) saved successfully'), { variant: 'success' });
    onClose();
    if (
      attributes.nextAction &&
      attributes.nextAction !== ActivityTypeEnum.None &&
      attributes.nextAction !== task?.nextAction
    ) {
      openTaskModal({
        view: 'add',
        defaultValues: {
          activityType: attributes.nextAction,
          contactIds: attributes.contactIds,
          userId: task?.user?.id,
          tagList: task?.tagList,
        },
      });
    }
  };

  return (
    <Formik
      initialValues={initialTask}
      validationSchema={taskSchema}
      onSubmit={onSubmit}
      validateOnMount
      enableReinitialize
    >
      {({
        values: {
          activityType,
          subject,
          startAt,
          completedAt,
          result,
          nextAction,
          tagList,
          userId,
          contactIds,
          notificationTimeBefore,
          notificationType,
          notificationTimeUnit,
          location,
          comment,
        },
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
          <DialogContent dividers style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <FormFieldsGridContainer>
              <Grid item>
                <TextField
                  name="subject"
                  label={t('Task Name')}
                  value={subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  multiline
                  inputProps={{ 'aria-label': t('Subject') }}
                  error={!!errors.subject && touched.subject}
                  helperText={
                    errors.subject && touched.subject && t('Field is required')
                  }
                  required
                  inputRef={inputRef}
                />
              </Grid>
              <Grid item>
                <FormControl fullWidth>
                  <ActivityTypeAutocomplete
                    options={Object.values(ActivityTypeEnum)}
                    label={t('Action')}
                    value={activityType}
                    onChange={(activityType) =>
                      setFieldValue('activityType', activityType)
                    }
                  />
                </FormControl>
              </Grid>
              {activityType === ActivityTypeEnum.Appointment && (
                <Grid item>
                  <TextField
                    label={t('Location')}
                    value={location}
                    onChange={handleChange('location')}
                    fullWidth
                    multiline
                    inputProps={{ 'aria-label': t('Location') }}
                  />
                </Grid>
              )}
              <Grid item>
                <AssigneeAutocomplete
                  accountListId={accountListId}
                  value={userId}
                  onChange={(userId) => setFieldValue('userId', userId)}
                />
              </Grid>
              {!initialTask.completedAt && (
                <Grid item>
                  <FormControl fullWidth>
                    <Grid container spacing={2}>
                      <Grid xs={6} item>
                        <DatePicker
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <CalendarToday
                                  style={{
                                    color: theme.palette.cruGrayMedium.main,
                                  }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          renderInput={(params) => (
                            <TextField fullWidth {...params} />
                          )}
                          inputFormat={getDateFormatPattern(locale)}
                          closeOnSelect
                          label={t('Due Date')}
                          value={startAt}
                          onChange={(date): void =>
                            setFieldValue('startAt', date)
                          }
                        />
                      </Grid>
                      <Grid xs={6} item>
                        <TimePicker
                          renderInput={(params) => (
                            <TextField fullWidth {...params} />
                          )}
                          closeOnSelect
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Schedule
                                  style={{
                                    color: theme.palette.cruGrayMedium.main,
                                  }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          label={t('Due Time')}
                          value={startAt}
                          onChange={(date): void =>
                            setFieldValue('startAt', date)
                          }
                        />
                      </Grid>
                    </Grid>
                  </FormControl>
                </Grid>
              )}
              {initialTask.completedAt && (
                <Grid item>
                  <FormControl fullWidth>
                    <Grid container spacing={2}>
                      <Grid xs={6} item>
                        <DatePicker
                          renderInput={(params) => (
                            <TextField fullWidth {...params} />
                          )}
                          inputFormat={getDateFormatPattern(locale)}
                          closeOnSelect
                          label={t('Completed Date')}
                          value={completedAt}
                          onChange={(date): void =>
                            setFieldValue('completedAt', date)
                          }
                        />
                      </Grid>
                      <Grid xs={6} item>
                        <TimePicker
                          renderInput={(params) => (
                            <TextField fullWidth {...params} />
                          )}
                          closeOnSelect
                          label={t('Completed Time')}
                          value={completedAt}
                          onChange={(date): void =>
                            setFieldValue('completedAt', date)
                          }
                        />
                      </Grid>
                    </Grid>
                  </FormControl>
                </Grid>
              )}
              <Grid item>
                <ContactsAutocomplete
                  accountListId={accountListId}
                  value={contactIds}
                  onChange={(contactIds) =>
                    setFieldValue('contactIds', contactIds)
                  }
                />
              </Grid>
              {initialTask.completedAt && availableResults.length > 0 && (
                <Grid item>
                  <FormControl fullWidth required>
                    <InputLabel id="result">{t('Result')}</InputLabel>
                    <Select
                      label={t('Result')}
                      labelId="result"
                      value={result}
                      onChange={(e) => setFieldValue('result', e.target.value)}
                    >
                      {availableResults.map((val) => (
                        <MenuItem key={val} value={val}>
                          {getLocalizedResultString(t, val)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {initialTask.completedAt && availableNextActions.length > 0 && (
                <Grid item>
                  <ActivityTypeAutocomplete
                    options={availableNextActions}
                    label={t('Next Action')}
                    value={nextAction}
                    onChange={(nextAction) =>
                      setFieldValue('nextAction', nextAction)
                    }
                  />
                </Grid>
              )}
              <Grid item>
                <TagsAutocomplete
                  accountListId={accountListId}
                  type={TagTypeEnum.Tag}
                  value={tagList ?? []}
                  onChange={(tagList) => setFieldValue('tagList', tagList)}
                />
              </Grid>
              {!initialTask.completedAt && (
                <Grid item>
                  <Tooltip
                    title={
                      <Typography>
                        {t('If blank you will not be notified')}
                      </Typography>
                    }
                  >
                    <Typography
                      style={{
                        display: 'flex',
                        marginBottom: theme.spacing(1),
                      }}
                    >
                      {t('Notifications')}
                      <InfoIcon style={{ marginLeft: '5px' }} />
                    </Typography>
                  </Tooltip>
                  <Grid container spacing={2}>
                    <Grid xs={4} item>
                      <FormControl fullWidth>
                        <InputLabel
                          style={{ display: 'flex', alignItems: 'center' }}
                          id="notificationType"
                        >
                          {t('Type')}
                        </InputLabel>
                        <Tooltip
                          placement="top"
                          title={
                            <Typography>
                              {t('How the notification will be sent')}
                            </Typography>
                          }
                        >
                          <NullableSelect
                            labelId="notificationType"
                            value={notificationType}
                            onChange={(e) =>
                              setFieldValue('notificationType', e.target.value)
                            }
                            label={t('Type')}
                          >
                            {Object.values(NotificationTypeEnum).map((val) => (
                              <MenuItem key={val} value={val}>
                                {getLocalizedNotificationType(t, val)}
                              </MenuItem>
                            ))}
                          </NullableSelect>
                        </Tooltip>
                      </FormControl>
                    </Grid>
                    <Grid xs={3} item>
                      <Tooltip
                        placement="top"
                        title={
                          <Typography>
                            {t('Amount of time before notification')}
                          </Typography>
                        }
                      >
                        <TextField
                          label={
                            <Typography
                              style={{ display: 'flex', alignItems: 'center' }}
                            >
                              {t('Time')}
                            </Typography>
                          }
                          fullWidth
                          value={notificationTimeBefore ?? ''}
                          onChange={handleChange('notificationTimeBefore')}
                          inputProps={{
                            'aria-label': t('Time'),
                            type: 'number',
                            min: 0,
                          }}
                        />
                      </Tooltip>
                    </Grid>
                    <Grid xs={5} item>
                      <FormControl fullWidth>
                        <InputLabel id="notificationTimeUnit">
                          <Typography
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            {t('Unit')}
                          </Typography>
                        </InputLabel>
                        <Tooltip
                          placement="top"
                          title={
                            <Typography>
                              {t('Days, hours, or minutes')}
                            </Typography>
                          }
                        >
                          <NullableSelect
                            labelId="notificationTimeUnit"
                            value={notificationTimeUnit}
                            onChange={(e) =>
                              setFieldValue(
                                'notificationTimeUnit',
                                e.target.value,
                              )
                            }
                            label={t('Unit')}
                          >
                            {Object.values(NotificationTimeUnitEnum).map(
                              (val) => (
                                <MenuItem key={val} value={val}>
                                  {getLocalizedNotificationTimeUnit(t, val)}
                                </MenuItem>
                              ),
                            )}
                          </NullableSelect>
                        </Tooltip>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              {!initialTask.completedAt && view !== 'edit' && (
                <Grid item>
                  <TextField
                    label={t('Comment')}
                    value={comment}
                    onChange={(event) =>
                      setFieldValue('comment', event.target.value)
                    }
                    fullWidth
                    multiline
                    inputProps={{ 'aria-label': t('Comment') }}
                  />
                </Grid>
              )}
            </FormFieldsGridContainer>
          </DialogContent>
          <DialogActions>
            {task?.id ? (
              <DeleteButton onClick={() => handleRemoveDialog(true)} />
            ) : null}
            <CancelButton disabled={isSubmitting} onClick={onClose} />
            <SubmitButton disabled={!isValid || isSubmitting}>
              {(saving || creating) && (
                <>
                  <CircularProgress color="primary" size={20} />
                  &nbsp;
                </>
              )}
              {t('Save')}
            </SubmitButton>
            <DeleteConfirmation
              accountListId={accountListId}
              deleteType={t('task')}
              open={removeDialogOpen}
              onClickDecline={handleRemoveDialog}
              onClose={onClose}
              taskId={task?.id}
            />
          </DialogActions>
        </form>
      )}
    </Formik>
  );
};

export default TaskModalForm;
