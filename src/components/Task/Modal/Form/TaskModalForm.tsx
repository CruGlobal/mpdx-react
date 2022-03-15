import React, { ReactElement, useCallback, useState } from 'react';
import {
  TextField,
  Select,
  styled,
  MenuItem,
  InputLabel,
  FormControl,
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
  InputAdornment,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Autocomplete } from '@material-ui/lab';

import { DatePicker, TimePicker } from '@material-ui/pickers';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { DateTime } from 'luxon';
import { CalendarToday, Schedule } from '@material-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import debounce from 'lodash/fp/debounce';
import { dateFormat } from '../../../../lib/intlFormat/intlFormat';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  TaskCreateInput,
  TaskUpdateInput,
} from '../../../../../graphql/types.generated';
import { GetTaskForTaskDrawerQuery } from '../../Drawer/TaskDrawerTask.generated';
import { GetTasksForTaskListDocument } from '../../List/TaskList.generated';
import { TaskFilter } from '../../List/List';
import { GetThisWeekDocument } from '../../../Dashboard/ThisWeek/GetThisWeek.generated';
import {
  useGetDataForTaskDrawerQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetTaskModalContactsFilteredQuery,
} from '../../Drawer/Form/TaskDrawer.generated';
import theme from '../../../../../src/theme';
import { useCreateTaskCommentMutation } from '../../Drawer/CommentList/Form/CreateTaskComment.generated';
import { FormFieldsGridContainer } from './Container/FormFieldsGridContainer';
import { TasksDocument } from 'pages/accountLists/[accountListId]/tasks/Tasks.generated';
import { ContactTasksTabDocument } from 'src/components/Contacts/ContactDetails/ContactTasksTab/ContactTasksTab.generated';
import { ModalDeleteButton } from 'src/components/common/Modal/DeleteButton/ModalDeleteButton';

export const ActionButton = styled(Button)(() => ({
  color: theme.palette.info.main,
  fontWeight: 550,
}));

export const FormFieldsWrapper = styled(Box)(() => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(4),
  width: '100%',
  margin: 'auto',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflowY: 'auto',
}));

const LoadingIndicator = styled(CircularProgress)(() => ({
  display: 'flex',
  margin: 'auto',
}));

const taskSchema: yup.SchemaOf<
  Omit<TaskCreateInput | TaskUpdateInput, 'result' | 'nextAction'>
> = yup.object({
  id: yup.string().nullable(),
  activityType: yup.mixed<ActivityTypeEnum>(),
  subject: yup.string().required(),
  starred: yup.boolean().nullable(),
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
  defaultValues?: Partial<TaskCreateInput & TaskUpdateInput>;
  filter?: TaskFilter;
  rowsPerPage: number;
}

const TaskModalForm = ({
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
        activityType: defaultValues?.activityType || null,
        subject: '',
        startAt: DateTime.local().plus({ hours: 1 }).startOf('hour').toISO(),
        completedAt: null,
        tagList: defaultValues?.tagList || [],
        contactIds: defaultValues?.contactIds || [],
        userId: defaultValues?.userId || null,
        notificationTimeBefore: null,
        notificationType: null,
        notificationTimeUnit: null,
      };
  const { t } = useTranslation();
  const [commentBody, changeCommentBody] = useState('');

  const [removeDialogOpen, handleRemoveDialog] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [createTask, { loading: creating }] = useCreateTaskMutation();
  const [updateTask, { loading: saving }] = useUpdateTaskMutation();
  const [deleteTask, { loading: deleting }] = useDeleteTaskMutation();
  const [createTaskComment] = useCreateTaskCommentMutation();
  const [selectedIds, setSelectedIds] = useState(
    task?.contacts.nodes.map((contact) => contact.id) ||
      defaultValues?.contactIds ||
      [],
  );

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchTermChange = useCallback(
    debounce(500, (event) => {
      setSearchTerm(event.target.value);
    }),
    [],
  );

  const { data, loading } = useGetDataForTaskDrawerQuery({
    variables: {
      accountListId,
    },
  });

  const {
    data: dataFilteredByName,
    loading: loadingFilteredByName,
  } = useGetTaskModalContactsFilteredQuery({
    variables: {
      accountListId,
      contactsFilters: { wildcardSearch: searchTerm as string },
    },
  });

  const {
    data: dataFilteredById,
    loading: loadingFilteredById,
  } = useGetTaskModalContactsFilteredQuery({
    variables: {
      accountListId,
      contactsFilters: { ids: selectedIds },
    },
  });

  const mergedContacts =
    dataFilteredByName && dataFilteredById
      ? dataFilteredByName?.contacts.nodes
          .concat(dataFilteredById?.contacts.nodes)
          .filter(
            (contact1, index, self) =>
              self.findIndex((contact2) => contact2.id === contact1.id) ===
              index,
          )
      : dataFilteredById?.contacts.nodes ||
        dataFilteredByName?.contacts.nodes ||
        data?.contacts.nodes ||
        [];

  const onSubmit = async (
    attributes: TaskCreateInput | TaskUpdateInput,
  ): Promise<void> => {
    const isUpdate = (
      attributes: TaskCreateInput | TaskUpdateInput,
    ): attributes is TaskUpdateInput => !!task;
    const body = commentBody.trim();
    if (isUpdate(attributes)) {
      await updateTask({
        variables: { accountListId, attributes },
        refetchQueries: [
          {
            query: TasksDocument,
            variables: { accountListId },
          },
          {
            query: ContactTasksTabDocument,
            variables: { accountListId },
          },
        ],
      });
    } else {
      await createTask({
        variables: { accountListId, attributes },
        update: (_cache, { data }) => {
          if (data?.createTask?.task.id && body !== '') {
            const id = uuidv4();

            createTaskComment({
              variables: {
                accountListId,
                taskId: data.createTask.task.id,
                attributes: { id, body },
              },
            });
          }
        },
        refetchQueries: [
          {
            query: GetTasksForTaskListDocument,
            variables: { accountListId, first: rowsPerPage, ...filter },
          },
          {
            query: TasksDocument,
            variables: { accountListId },
          },
          {
            query: ContactTasksTabDocument,
            variables: {
              accountListId,
              tasksFilter: {
                contactIds: [
                  defaultValues?.contactIds ? defaultValues.contactIds[0] : '',
                ],
              },
            },
          },
        ],
      });
    }
    enqueueSnackbar(t('Task saved successfully'), { variant: 'success' });
    onClose();
  };

  const onDeleteTask = async (): Promise<void> => {
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
  };

  return (
    <Box>
      <Formik
        initialValues={_.omit(initialTask, '__typename')}
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
            <FormFieldsWrapper>
              <FormFieldsGridContainer>
                <Grid item>
                  <TextField
                    label={t('Task Name')}
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
                    required
                  />
                </Grid>
                <Grid item>
                  <FormControl fullWidth>
                    <InputLabel id="activityType">{t('Action')}</InputLabel>
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
                  <Autocomplete
                    loading={loading}
                    options={
                      (data?.accountListUsers?.nodes &&
                        data.accountListUsers.nodes.map(
                          ({ user }) => user.id,
                        )) ||
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
                    <FormControl fullWidth>
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
                    multiple
                    options={
                      (
                        mergedContacts &&
                        [...mergedContacts].sort((a, b) =>
                          a.name.localeCompare(b.name),
                        )
                      )?.map(({ id }) => id) || []
                    }
                    getOptionLabel={(contactId) =>
                      mergedContacts.find(({ id }) => id === contactId)?.name ??
                      ''
                    }
                    loading={
                      loading || loadingFilteredById || loadingFilteredByName
                    }
                    renderInput={(params): ReactElement => {
                      return !loadingFilteredById ? (
                        <TextField
                          {...params}
                          onChange={handleSearchTermChange}
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
                      ) : (
                        <CircularProgress color="primary" size={20} />
                      );
                    }}
                    value={contactIds ?? undefined}
                    onChange={(_, contactIds): void => {
                      setFieldValue('contactIds', contactIds);
                      setSelectedIds(contactIds);
                    }}
                    getOptionSelected={(option, value): boolean =>
                      option === value
                    }
                  />
                </Grid>
                <Grid item>
                  <Typography>Notifications</Typography>
                  <Grid container spacing={2}>
                    <Grid xs={4} item>
                      <FormControl fullWidth>
                        <InputLabel id="notificationType">
                          {t('Type')}
                        </InputLabel>
                        <Select
                          labelId="notificationType"
                          value={notificationType}
                          onChange={handleChange('notificationType')}
                        >
                          <MenuItem value={undefined}>{t('None')}</MenuItem>
                          {Object.values(NotificationTypeEnum).map((val) => (
                            <MenuItem key={val} value={val}>
                              {t(val) /* manually added to translation file */}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
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
                      <FormControl fullWidth>
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
                  </Grid>
                </Grid>
                <Grid item>
                  <TextField
                    label={t('Comment')}
                    value={commentBody}
                    onChange={(event) => changeCommentBody(event.target.value)}
                    fullWidth
                    multiline
                    inputProps={{ 'aria-label': 'Comment' }}
                  />
                </Grid>
              </FormFieldsGridContainer>
            </FormFieldsWrapper>
            <Divider />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              p={1}
            >
              <Box>
                {task?.id ? (
                  <ModalDeleteButton
                    onClick={() => handleRemoveDialog(true)}
                    size="large"
                  />
                ) : null}
              </Box>
              <Box>
                <ActionButton
                  size="large"
                  disabled={isSubmitting}
                  onClick={onClose}
                >
                  {t('Cancel')}
                </ActionButton>
                <ActionButton
                  size="large"
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
                </ActionButton>
              </Box>

              <Dialog
                open={removeDialogOpen}
                aria-labelledby={t('Remove task confirmation')}
                fullWidth
                maxWidth="sm"
              >
                <DialogTitle>{t('Confirm')}</DialogTitle>
                <DialogContent dividers>
                  {deleting ? (
                    <LoadingIndicator color="primary" size={50} />
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
    </Box>
  );
};

export default TaskModalForm;
