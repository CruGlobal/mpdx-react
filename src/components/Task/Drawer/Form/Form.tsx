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
import { DeepOmit } from 'ts-essentials';
import { dateFormat } from '../../../../lib/intlFormat/intlFormat';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  Task,
} from '../../../../../graphql/types.generated';
import { GetTaskForTaskDrawerQuery } from '../TaskDrawerTask.generated';
import {
  GetTasksForTaskListDocument,
  GetTasksForTaskListQuery,
} from '../../List/TaskList.generated';
import { TaskFilter } from '../../List/List';
import {
  useGetDataForTaskDrawerQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  GetDataForTaskDrawerQuery,
  TaskMutationResponseFragment,
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
}));

type TaskMutationResponseFragmentWithoutTypename = DeepOmit<
  TaskMutationResponseFragment,
  {
    __typename?: never;
    contacts: { __typename?: never };
    user?: { __typename?: never };
  }
>;

const taskSchema: yup.SchemaOf<TaskMutationResponseFragmentWithoutTypename> = yup.object(
  {
    id: yup.string().nullable(),
    activityType: yup.mixed<ActivityTypeEnum>(),
    subject: yup.string().required(),
    startAt: yup.string().nullable(),
    completedAt: yup.string().nullable(),
    tagList: yup.array().of(yup.string()).default([]),
    contacts: yup.object({
      nodes: yup
        .array()
        .of(
          yup.object({
            id: yup.string(),
            name: yup.string(),
          }),
        )
        .nullable(),
    }),
    user: yup
      .object({
        id: yup.string(),
        firstName: yup.string(),
        lastName: yup.string(),
      })
      .nullable(),
    notificationTimeBefore: yup.number().nullable(),
    notificationType: yup.mixed<NotificationTypeEnum>(),
    notificationTimeUnit: yup.mixed<NotificationTimeUnitEnum>(),
  },
);

interface Props {
  accountListId: string;
  task?: GetTaskForTaskDrawerQuery['task'];
  onClose: () => void;
  defaultValues?: Partial<GetTaskForTaskDrawerQuery['task']>;
  filter: TaskFilter;
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
  const initialTask: TaskMutationResponseFragmentWithoutTypename = task || {
    id: null,
    activityType: null,
    subject: '',
    startAt: DateTime.local().plus({ hours: 1 }).startOf('hour').toISO(),
    completedAt: null,
    tagList: [],
    contacts: {
      nodes: [],
    },
    user: null,
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
  const onSubmit = async (values: Task): Promise<void> => {
    const attributes = {
      ...values,
      userId: values.user?.id || null,
      contactIds: values.contacts.nodes.map(({ id }) => id),
    };

    try {
      if (task) {
        const {
          contacts: _contacts,
          user: _user,
          ...updateTaskAttributes
        } = attributes;
        await updateTask({
          variables: { accountListId, attributes: updateTaskAttributes },
        });
      } else {
        const {
          id: _id,
          contacts: _contacts,
          user: _user,
          ...createTaskAttributes
        } = attributes;
        await createTask({
          variables: { accountListId, attributes: createTaskAttributes },
        });
      }
      enqueueSnackbar(t('Task saved successfully'), { variant: 'success' });
      onClose();
    } catch (error) {
      debugger;
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const onDeleteTask = async (): Promise<void> => {
    try {
      if (task) {
        await deleteTask({
          variables: {
            accountListId,
            id: task.id,
          },
          update: (cache) => {
            const query = {
              query: GetTasksForTaskListDocument,
              variables: {
                accountListId,
                first: rowsPerPage,
                ...filter,
              },
            };
            const dataFromCache = cache.readQuery<GetTasksForTaskListQuery>(
              query,
            );

            cache.writeQuery({
              ...query,
              data: {
                tasks: {
                  ...dataFromCache.tasks,
                  nodes: dataFromCache.tasks.nodes.filter(
                    ({ id }) => id !== task.id,
                  ),
                },
              },
            });
          },
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
          user,
          contacts,
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
                  error={errors.subject && touched.subject}
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
                    <MenuItem value={null}>{t('None')}</MenuItem>
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
                        labelFunc={dateFormat}
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
                          labelFunc={dateFormat}
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
                  value={tagList}
                  options={data?.accountList?.taskTagList || []}
                />
              </Grid>
              <Grid item>
                <Autocomplete
                  loading={loading}
                  options={
                    (data?.accountListUsers?.nodes &&
                      data.accountListUsers.nodes.map(({ user }) => user)) ||
                    []
                  }
                  getOptionLabel={({ firstName, lastName }): string =>
                    `${firstName} ${lastName}`
                  }
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
                  value={user}
                  onChange={(_, user): void => setFieldValue('user', user)}
                  getOptionSelected={(option, value): boolean =>
                    option.id === value.id
                  }
                />
              </Grid>
              <Grid item>
                <Autocomplete
                  multiple
                  options={
                    (data?.contacts?.nodes &&
                      [...data.contacts.nodes].sort((a, b) =>
                        a.name.localeCompare(b.name),
                      )) ||
                    []
                  }
                  getOptionLabel={({
                    name,
                  }: GetDataForTaskDrawerQuery['contacts']['nodes'][0]): string =>
                    name
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
                  value={contacts.nodes}
                  onChange={(_, contacts): void =>
                    setFieldValue('contacts', { nodes: contacts })
                  }
                  getOptionSelected={(option, value): boolean =>
                    option.id === value.id
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
                              <MenuItem value={null}>{t('None')}</MenuItem>
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
                              <MenuItem value={null}>{t('None')}</MenuItem>
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
                  {deleting ? (
                    <CircularProgress color="primary" size={20} />
                  ) : (
                    <>
                      <DeleteIcon titleAccess={t('Remove')} />
                      {t('Remove')}
                    </>
                  )}
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
              maxWidth="sm"
            >
              <DialogTitle>{t('Confirm')}</DialogTitle>
              <DialogContent dividers>
                <DialogContentText>
                  {t('Are you sure you wish to delete the selected task?')}
                </DialogContentText>
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
