import React, { ReactElement, useState } from 'react';
import {
  makeStyles,
  Theme,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  Switch,
  Chip,
  Grid,
  Box,
  CircularProgress,
  Button,
  Divider,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Dialog,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Autocomplete } from '@material-ui/lab';

import { DatePicker, TimePicker } from '@material-ui/pickers';
import DeleteIcon from '@material-ui/icons/Delete';
import { motion, AnimatePresence } from 'framer-motion';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { DateTime } from 'luxon';
import { dateFormat } from '../../../../lib/intlFormat/intlFormat';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  TaskCreateInput,
  TaskUpdateInput,
} from '../../../../../graphql/types.generated';
import { GetTaskForTaskDrawerQuery } from '../TaskDrawerTask.generated';
import { GetTasksForTaskListDocument } from '../../List/TaskList.generated';
import { TaskFilter } from '../../List/List';
import { GetThisWeekDocument } from '../../../Dashboard/ThisWeek/GetThisWeek.generated';
import {
  useGetDataForTaskDrawerQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from './TaskDrawer.generated';

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    width: '100%',
  },
  select: {
    fontSize: theme.typography.h6.fontSize,
    minHeight: 'auto',
    '&:focus': {
      backgroundColor: 'transparent',
    },
  },
  container: {
    padding: theme.spacing(2, 2),
  },
  title: {
    flexGrow: 1,
  },
  removeButton: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
  loadingIndicator: {
    display: 'flex',
    margin: 'auto',
  },
}));

const taskSchema: yup.SchemaOf<
  Omit<TaskCreateInput | TaskUpdateInput, 'result' | 'nextAction'>
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

interface Props {
  accountListId: string;
  task?: GetTaskForTaskDrawerQuery['task'];
  onClose: () => void;
  defaultValues?: Partial<GetTaskForTaskDrawerQuery['task']>;
  filter?: TaskFilter;
  rowsPerPage: number;
}

const TaskDrawerForm = ({
  accountListId,
  task,
  onClose,
  defaultValues,
  filter,
  rowsPerPage,
}: Props): ReactElement => {
  const initialTask: TaskCreateInput | TaskUpdateInput = task
    ? {
        ...(({ user: _user, contacts: _contacts, ...task }) => task)(task),
        userId: task.user?.id,
        contactIds: task.contacts.nodes.map(({ id }) => id),
      }
    : {
        id: null,
        activityType: null,
        subject: '',
        startAt: DateTime.local().plus({ hours: 1 }).startOf('hour').toISO(),
        completedAt: null,
        tagList: [],
        contactIds: [],
        userId: null,
        notificationTimeBefore: null,
        notificationType: null,
        notificationTimeUnit: null,
        ...defaultValues,
      };
  const classes = useStyles();
  const { t } = useTranslation();

  const [removeDialogOpen, handleRemoveDialog] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [notification, setNotification] = useState(
    initialTask.notificationTimeBefore !== null ||
      initialTask.notificationType !== null ||
      initialTask.notificationTimeUnit !== null,
  );
  const handleNotificationChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (name: string, value: null) => void,
  ): void => {
    setNotification(event.target.checked);

    if (!event.target.checked) {
      setFieldValue('notificationTimeBefore', null);
      setFieldValue('notificationType', null);
      setFieldValue('notificationTimeUnit', null);
    }
  };
  const { data, loading } = useGetDataForTaskDrawerQuery({
    variables: { accountListId },
  });
  const [createTask, { loading: creating }] = useCreateTaskMutation();
  const [updateTask, { loading: saving }] = useUpdateTaskMutation();
  const [deleteTask, { loading: deleting }] = useDeleteTaskMutation();
  const onSubmit = async (
    attributes: TaskCreateInput | TaskUpdateInput,
  ): Promise<void> => {
    const isUpdate = (
      attributes: TaskCreateInput | TaskUpdateInput,
    ): attributes is TaskUpdateInput => !!task;

    try {
      if (isUpdate(attributes)) {
        await updateTask({
          variables: { accountListId, attributes },
        });
      } else {
        await createTask({
          variables: { accountListId, attributes },
        });
      }
      enqueueSnackbar(t('Task saved successfully'), { variant: 'success' });
      onClose();
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
      throw error;
    }
  };

  const onDeleteTask = async (): Promise<void> => {
    try {
      if (task) {
        const endOfDay = DateTime.local().endOf('day');
        await deleteTask({
          variables: {
            accountListId,
            id: task.id,
          },
          refetchQueries: [
            {
              query: GetTasksForTaskListDocument,
              variables: { accountListId, first: rowsPerPage, ...filter },
            },
            {
              query: GetThisWeekDocument,
              variables: {
                accountListId,
                endOfDay: endOfDay.toISO(),
                today: endOfDay.toISODate(),
                twoWeeksFromNow: endOfDay.plus({ weeks: 2 }).toISODate(),
                twoWeeksAgo: endOfDay.minus({ weeks: 2 }).toISODate(),
              },
            },
          ],
        });
        enqueueSnackbar(t('Task deleted successfully'), { variant: 'success' });
        handleRemoveDialog(false);
        onClose();
      }
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
      throw error;
    }
  };

  return (
    <Formik
      initialValues={initialTask}
      validationSchema={taskSchema}
      onSubmit={onSubmit}
    >
      {({
        values: {
          activityType,
          subject,
          startAt,
          completedAt,
          tagList,
          userId,
          contactIds,
          notificationTimeBefore,
          notificationType,
          notificationTimeUnit,
        },
        setFieldValue,
        handleChange,
        handleSubmit,
        isSubmitting,
        isValid,
        errors,
        touched,
      }): ReactElement => (
        <form onSubmit={handleSubmit} noValidate>
          <Box m={2}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField
                  label={t('Subject')}
                  value={subject}
                  onChange={handleChange('subject')}
                  fullWidth
                  multiline
                  inputProps={{ 'aria-label': 'Subject' }}
                  error={!!errors.subject && touched.subject}
                  helperText={
                    errors.subject && touched.subject && t('Field is required')
                  }
                  required
                />
              </Grid>
              <Grid item>
                <FormControl className={classes.formControl}>
                  <InputLabel id="activityType">{t('Type')}</InputLabel>
                  <Select
                    labelId="activityType"
                    value={activityType}
                    onChange={handleChange('activityType')}
                  >
                    <MenuItem value={undefined}>{t('None')}</MenuItem>
                    {Object.values(ActivityTypeEnum).map((val) => (
                      <MenuItem key={val} value={val}>
                        {t(val) /* manually added to translation file */}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl className={classes.formControl}>
                  <Grid container spacing={2}>
                    <Grid xs={6} item>
                      <DatePicker
                        clearable
                        fullWidth
                        labelFunc={(date, invalidLabel) =>
                          date ? dateFormat(date) : invalidLabel
                        }
                        autoOk
                        label={t('Due Date')}
                        value={startAt}
                        onChange={(date): void =>
                          setFieldValue('startAt', date)
                        }
                        okLabel={t('OK')}
                        todayLabel={t('Today')}
                        cancelLabel={t('Cancel')}
                        clearLabel={t('Clear')}
                      />
                    </Grid>
                    <Grid xs={6} item>
                      <TimePicker
                        clearable
                        fullWidth
                        autoOk
                        label={t('Due Time')}
                        value={startAt}
                        onChange={(date): void =>
                          setFieldValue('startAt', date)
                        }
                        okLabel={t('OK')}
                        todayLabel={t('Today')}
                        cancelLabel={t('Cancel')}
                        clearLabel={t('Clear')}
                      />
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>
              {initialTask.completedAt && (
                <Grid item>
                  <FormControl className={classes.formControl}>
                    <Grid container spacing={2}>
                      <Grid xs={6} item>
                        <DatePicker
                          clearable
                          fullWidth
                          labelFunc={(date, invalidLabel) =>
                            date ? dateFormat(date) : invalidLabel
                          }
                          autoOk
                          label={t('Completed Date')}
                          value={completedAt}
                          onChange={(date): void =>
                            setFieldValue('completedAt', date)
                          }
                          okLabel={t('OK')}
                          todayLabel={t('Today')}
                          cancelLabel={t('Cancel')}
                          clearLabel={t('Clear')}
                        />
                      </Grid>
                      <Grid xs={6} item>
                        <TimePicker
                          clearable
                          fullWidth
                          autoOk
                          label={t('Completed Time')}
                          value={completedAt}
                          onChange={(date): void =>
                            setFieldValue('completedAt', date)
                          }
                          okLabel={t('OK')}
                          todayLabel={t('Today')}
                          cancelLabel={t('Cancel')}
                          clearLabel={t('Clear')}
                        />
                      </Grid>
                    </Grid>
                  </FormControl>
                </Grid>
              )}
              <Grid item>
                <Autocomplete
                  multiple
                  freeSolo
                  renderTags={(value, getTagProps): ReactElement[] =>
                    value.map((option, index) => (
                      <Chip
                        color="primary"
                        size="small"
                        key={index}
                        label={option}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params): ReactElement => (
                    <TextField {...params} label={t('Tags')} />
                  )}
                  onChange={(_, tagList): void =>
                    setFieldValue('tagList', tagList)
                  }
                  value={tagList ?? undefined}
                  options={data?.accountList?.taskTagList || []}
                />
              </Grid>
              <Grid item>
                <Autocomplete
                  loading={loading}
                  options={
                    (data?.accountListUsers?.nodes &&
                      data.accountListUsers.nodes.map(({ user }) => user.id)) ||
                    []
                  }
                  getOptionLabel={(userId): string => {
                    const user = data?.accountListUsers?.nodes.find(
                      ({ user }) => user.id === userId,
                    )?.user;
                    return `${user?.firstName} ${user?.lastName}`;
                  }}
                  renderInput={(params): ReactElement => (
                    <TextField
                      {...params}
                      label={t('Assignee')}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loading && (
                              <CircularProgress color="primary" size={20} />
                            )}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  value={userId}
                  onChange={(_, userId): void =>
                    setFieldValue('userId', userId)
                  }
                  getOptionSelected={(option, value): boolean =>
                    option === value
                  }
                />
              </Grid>
              <Grid item>
                <Autocomplete
                  multiple
                  options={
                    (
                      data?.contacts?.nodes &&
                      [...data.contacts.nodes].sort((a, b) =>
                        a.name.localeCompare(b.name),
                      )
                    )?.map(({ id }) => id) || []
                  }
                  getOptionLabel={(contactId) =>
                    data?.contacts.nodes.find(({ id }) => id === contactId)
                      ?.name ?? ''
                  }
                  loading={loading}
                  renderInput={(params): ReactElement => (
                    <TextField
                      {...params}
                      label={t('Contacts')}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loading && (
                              <CircularProgress color="primary" size={20} />
                            )}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  value={contactIds ?? undefined}
                  onChange={(_, contactIds): void =>
                    setFieldValue('contactIds', contactIds)
                  }
                  getOptionSelected={(option, value): boolean =>
                    option === value
                  }
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notification}
                      onChange={(event): void =>
                        handleNotificationChange(event, setFieldValue)
                      }
                    />
                  }
                  label={t('Notification')}
                />
                <AnimatePresence>
                  {notification && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 64, opacity: 1 }}
                      exit={{ height: 10, opacity: 0 }}
                    >
                      <Grid item container spacing={2}>
                        <Grid xs={3} item>
                          <TextField
                            label={t('Period')}
                            fullWidth
                            value={notificationTimeBefore}
                            onChange={handleChange('notificationTimeBefore')}
                            inputProps={{
                              'aria-label': 'Period',
                              type: 'number',
                            }}
                          />
                        </Grid>
                        <Grid xs={5} item>
                          <FormControl className={classes.formControl}>
                            <InputLabel id="notificationTimeUnit">
                              {t('Unit')}
                            </InputLabel>
                            <Select
                              labelId="notificationTimeUnit"
                              value={notificationTimeUnit}
                              onChange={handleChange('notificationTimeUnit')}
                            >
                              <MenuItem value={undefined}>{t('None')}</MenuItem>
                              {Object.values(NotificationTimeUnitEnum).map(
                                (val) => (
                                  <MenuItem key={val} value={val}>
                                    {
                                      t(
                                        val,
                                      ) /* manually added to translation file */
                                    }
                                  </MenuItem>
                                ),
                              )}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid xs={4} item>
                          <FormControl className={classes.formControl}>
                            <InputLabel id="notificationType">
                              {t('Platform')}
                            </InputLabel>
                            <Select
                              labelId="notificationType"
                              value={notificationType}
                              onChange={handleChange('notificationType')}
                            >
                              <MenuItem value={undefined}>{t('None')}</MenuItem>
                              {Object.values(NotificationTypeEnum).map(
                                (val) => (
                                  <MenuItem key={val} value={val}>
                                    {
                                      t(
                                        val,
                                      ) /* manually added to translation file */
                                    }
                                  </MenuItem>
                                ),
                              )}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Grid>
            </Grid>
          </Box>
          <Divider />
          <Box m={2}>
            <Grid container spacing={1} justify="flex-end">
              <Grid container item xs={8} justify="flex-start">
                <Button
                  size="large"
                  variant="contained"
                  className={classes.removeButton}
                  onClick={() => handleRemoveDialog(true)}
                >
                  <DeleteIcon />
                  {t('Remove')}
                </Button>
              </Grid>
              <Grid item xs={2}>
                <Button size="large" disabled={isSubmitting} onClick={onClose}>
                  {t('Cancel')}
                </Button>
              </Grid>
              <Grid item xs={2}>
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  disabled={!isValid || isSubmitting}
                  type="submit"
                >
                  {(saving || creating) && (
                    <>
                      <CircularProgress color="primary" size={20} />
                      &nbsp;
                    </>
                  )}
                  {t('Save')}
                </Button>
              </Grid>
            </Grid>
            <Dialog
              open={removeDialogOpen}
              aria-labelledby={t('Remove task confirmation')}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>{t('Confirm')}</DialogTitle>
              <DialogContent dividers>
                {deleting ? (
                  <CircularProgress
                    className={classes.loadingIndicator}
                    color="primary"
                    size={50}
                  />
                ) : (
                  <DialogContentText>
                    {t('Are you sure you wish to delete the selected task?')}
                  </DialogContentText>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => handleRemoveDialog(false)}>
                  {t('No')}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onDeleteTask}
                >
                  {t('Yes')}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default TaskDrawerForm;
