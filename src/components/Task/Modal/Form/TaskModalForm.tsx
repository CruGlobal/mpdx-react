import React, { ReactElement, useCallback, useState } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Grid,
  CircularProgress,
  InputAdornment,
  Typography,
  Tooltip,
  Autocomplete,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { DateTime } from 'luxon';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Schedule from '@mui/icons-material/Schedule';
import _ from 'lodash';
import debounce from 'lodash/fp/debounce';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  ResultEnum,
  TaskCreateInput,
  TaskUpdateInput,
} from '../../../../../graphql/types.generated';
import { GetTasksForTaskListDocument } from '../../List/TaskList.generated';
import { TaskFilter } from '../../List/List';
import {
  useGetDataForTaskModalQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetTaskModalContactsFilteredQuery,
} from '../../Modal/Form/TaskModal.generated';
import theme from '../../../../../src/theme';
import { useCreateTaskCommentMutation } from '../../Modal/Comments/Form/CreateTaskComment.generated';
import { FormFieldsGridContainer } from './Container/FormFieldsGridContainer';
import { TasksDocument } from 'pages/accountLists/[accountListId]/tasks/Tasks.generated';
import { ContactTasksTabDocument } from 'src/components/Contacts/ContactDetails/ContactTasksTab/ContactTasksTab.generated';
import { DeleteConfirmation } from 'src/components/common/Modal/DeleteConfirmation/DeleteConfirmation';
import {
  SubmitButton,
  CancelButton,
  DeleteButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { possibleResults } from './PossibleResults';
import { possibleNextActions } from './PossibleNextActions';
import useTaskModal from 'src/hooks/useTaskModal';
import { GetTaskForTaskModalQuery } from '../TaskModalTask.generated';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import { v4 as uuidv4 } from 'uuid';

const taskSchema: yup.SchemaOf<
  Omit<TaskCreateInput | TaskUpdateInput, 'result' | 'nextAction'>
> = yup.object({
  id: yup.string().nullable(),
  activityType: yup.mixed<ActivityTypeEnum>(),
  subject: yup.string().required(),
  starred: yup.boolean().nullable(),
  startAt: yup.string().nullable(),
  completedAt: yup.string().nullable(),
  result: yup.mixed<ResultEnum>(),
  nextAction: yup.mixed<ActivityTypeEnum>(),
  tagList: yup.array().of(yup.string()).default([]),
  contactIds: yup.array().of(yup.string()).default([]),
  userId: yup.string().nullable(),
  notificationTimeBefore: yup.number().nullable(),
  notificationType: yup.mixed<NotificationTypeEnum>(),
  notificationTimeUnit: yup.mixed<NotificationTimeUnitEnum>(),
});

interface Props {
  accountListId: string;
  task?: GetTaskForTaskModalQuery['task'];
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
        subject: defaultValues?.subject || '',
        startAt: DateTime.local().plus({ hours: 1 }).startOf('hour').toISO(),
        completedAt: null,
        result: defaultValues?.result || null,
        nextAction: defaultValues?.nextAction || null,
        tagList: defaultValues?.tagList || [],
        contactIds: defaultValues?.contactIds || [],
        userId: defaultValues?.userId || null,
        notificationTimeBefore: null,
        notificationType: null,
        notificationTimeUnit: null,
      };

  const { t } = useTranslation();
  const { openTaskModal } = useTaskModal();
  const [removeDialogOpen, handleRemoveDialog] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [commentBody, changeCommentBody] = useState('');

  const [createTask, { loading: creating }] = useCreateTaskMutation();
  const [updateTask, { loading: saving }] = useUpdateTaskMutation();
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

  const { data, loading } = useGetDataForTaskModalQuery({
    variables: {
      accountListId,
    },
  });

  const { data: dataFilteredByName, loading: loadingFilteredByName } =
    useGetTaskModalContactsFilteredQuery({
      variables: {
        accountListId,
        contactsFilters: { wildcardSearch: searchTerm as string },
      },
    });

  const { data: dataFilteredById, loading: loadingFilteredById } =
    useGetTaskModalContactsFilteredQuery({
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

  const availableResults = task ? possibleResults(task) : [];
  const availableNextActions = task ? possibleNextActions(task) : [];

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
                contactIds:
                  defaultValues?.contactIds && defaultValues?.contactIds[0]
                    ? [defaultValues.contactIds[0]]
                    : [],
              },
            },
          },
        ],
      });
    }
    enqueueSnackbar(t('Task saved successfully'), { variant: 'success' });
    onClose();
    if (
      attributes.nextAction &&
      attributes.nextAction !== ActivityTypeEnum.None &&
      attributes.nextAction !== task?.nextAction
    ) {
      openTaskModal({
        defaultValues: {
          activityType: attributes.nextAction,
          contactIds: task?.contacts.nodes.map((contact) => contact.id),
          userId: task?.user?.id,
          tagList: task?.tagList,
        },
      });
    }
  };

  return (
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
          result,
          nextAction,
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
          <DialogContent dividers>
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
                    errors.subject && touched.subject && t('Field is required')
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
                    onChange={(e) =>
                      setFieldValue('activityType', e.target.value)
                    }
                    label={t('Action')}
                  >
                    <MenuItem value={undefined}>{t('None')}</MenuItem>
                    {Object.values(ActivityTypeEnum)
                      .filter((val) => val !== 'NONE')
                      .map((val) => (
                        <MenuItem key={val} value={val}>
                          {getLocalizedTaskType(t, val)}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                {!loading ? (
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
                    isOptionEqualToValue={(option, value): boolean =>
                      option === value
                    }
                  />
                ) : (
                  <CircularProgress color="primary" size={20} />
                )}
              </Grid>
              {!initialTask.completedAt && (
                <Grid item>
                  <FormControl fullWidth>
                    <Grid container spacing={2}>
                      <Grid xs={6} item>
                        <MobileDatePicker
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
                          inputFormat="MMM dd, yyyy"
                          closeOnSelect
                          label={t('Due Date')}
                          value={startAt}
                          onChange={(date): void =>
                            setFieldValue('startAt', date)
                          }
                        />
                      </Grid>
                      <Grid xs={6} item>
                        <MobileTimePicker
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
                        <MobileDatePicker
                          renderInput={(params) => (
                            <TextField fullWidth {...params} />
                          )}
                          inputFormat="MMM dd, yyyy"
                          closeOnSelect
                          label={t('Completed Date')}
                          value={completedAt}
                          onChange={(date): void =>
                            setFieldValue('completedAt', date)
                          }
                        />
                      </Grid>
                      <Grid xs={6} item>
                        <MobileTimePicker
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
                  isOptionEqualToValue={(option, value): boolean =>
                    option === value
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
                          {t(val)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {initialTask.completedAt && availableNextActions.length > 0 && (
                <Grid item>
                  <FormControl fullWidth>
                    <InputLabel id="nextAction">{t('Next Action')}</InputLabel>
                    <Select
                      label={t('Next Action')}
                      labelId="nextAction"
                      value={nextAction}
                      onChange={(e) =>
                        setFieldValue('nextAction', e.target.value)
                      }
                    >
                      {availableNextActions.map((val) => (
                        <MenuItem key={val} value={val}>
                          {t(val) /* manually added to translation file */}
                        </MenuItem>
                      ))}
                    </Select>
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
                        {...getTagProps({ index })}
                        color="default"
                        size="small"
                        key={index}
                        label={option}
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
                      Notifications <InfoIcon style={{ marginLeft: '5px' }} />{' '}
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
                          <Select
                            labelId="notificationType"
                            value={notificationType}
                            onChange={(e) =>
                              setFieldValue('notificationType', e.target.value)
                            }
                            label={t('Type')}
                          >
                            <MenuItem value={undefined}>{t('None')}</MenuItem>
                            {Object.values(NotificationTypeEnum).map((val) => (
                              <MenuItem key={val} value={val}>
                                {
                                  t(
                                    val,
                                  ) /* manually added to translation file */
                                }
                              </MenuItem>
                            ))}
                          </Select>
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
                              {t(' Time')}
                            </Typography>
                          }
                          fullWidth
                          value={notificationTimeBefore}
                          onChange={handleChange('notificationTimeBefore')}
                          inputProps={{
                            'aria-label': 'Time',
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
                            {t(' Unit')}
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
                          <Select
                            labelId="notificationTimeUnit"
                            value={notificationTimeUnit}
                            onChange={(e) =>
                              setFieldValue(
                                'notificationTimeUnit',
                                e.target.value,
                              )
                            }
                            label={t(' Unit')}
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
                        </Tooltip>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <TextField
                      label={t('Comment')}
                      value={commentBody}
                      onChange={(event) =>
                        changeCommentBody(event.target.value)
                      }
                      fullWidth
                      multiline
                      inputProps={{ 'aria-label': 'Comment' }}
                    />
                  </Grid>
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
              deleteType="task"
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
