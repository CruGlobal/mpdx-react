import React, {
  ReactElement,
  useCallback,
  useState,
  useRef,
  useEffect,
  ChangeEventHandler,
} from 'react';
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
import {
  useGetDataForTaskModalQuery,
  useCreateTasksMutation,
  useUpdateTaskMutation,
  useGetTaskModalContactsFilteredQuery,
} from '../../Modal/Form/TaskModal.generated';
import theme from '../../../../../src/theme';
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
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import { getLocalizedResultString } from 'src/utils/functions/getLocalizedResultStrings';
import {
  getLocalizedNotificationTimeUnit,
  getLocalizedNotificationType,
} from 'src/utils/functions/getLocalizedNotificationStrings';
import { GetTaskForTaskModalQuery } from '../TaskModalTask.generated';
import { NullableSelect } from 'src/components/NullableSelect/NullableSelect';
import { getDateFormatPattern } from 'src/lib/intlFormat/intlFormat';

const taskSchema = yup.object({
  id: yup.string().nullable(),
  activityType: yup.mixed<ActivityTypeEnum>().nullable(),
  subject: yup.string().required(),
  startAt: yup.string().nullable(),
  completedAt: yup.string().nullable(),
  result: yup.mixed<ResultEnum>().nullable(),
  nextAction: yup.mixed<ActivityTypeEnum>().nullable(),
  tagList: yup.array().of(yup.string()).default([]),
  contactIds: yup.array().of(yup.string()).default([]),
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
  const initialTask: Attributes = task
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
        notificationTimeBefore: null,
        notificationType: null,
        notificationTimeUnit: null,
        comment: '',
      }
    : {
        id: null,
        activityType: defaultValues?.activityType ?? null,
        location: '',
        subject: defaultValues?.subject ?? '',
        startAt: DateTime.local().plus({ hours: 1 }).startOf('hour').toISO(),
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
      };

  const { t } = useTranslation();
  const { openTaskModal } = useTaskModal();
  const [removeDialogOpen, handleRemoveDialog] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [createTasks, { loading: creating }] = useCreateTasksMutation();
  const [updateTask, { loading: saving }] = useUpdateTaskMutation();
  const [selectedIds, setSelectedIds] = useState(
    task?.contacts.nodes.map((contact) => contact.id) ||
      defaultValues?.contactIds ||
      [],
  );

  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) (inputRef.current as HTMLInputElement).focus();
  }, []);

  const handleSearchTermChange = useCallback<
    ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >(
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
        first: 10,
        contactsFilters: { wildcardSearch: searchTerm },
      },
    });

  const { data: dataFilteredById, loading: loadingFilteredById } =
    useGetTaskModalContactsFilteredQuery({
      variables: {
        accountListId,
        first: selectedIds.length,
        contactsFilters: { ids: selectedIds },
      },
      skip: selectedIds.length === 0,
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
      await createTasks({
        variables: {
          accountListId,
          attributes: { ...sharedAttributes, comment: comment?.trim() },
        },
        refetchQueries: [
          {
            query: TasksDocument,
            variables: { accountListId },
          },
          {
            query: ContactTasksTabDocument,
            variables: {
              accountListId,
              tasksFilter: {
                contactIds: defaultValues?.contactIds?.[0]
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
                  inputRef={inputRef}
                />
              </Grid>
              <Grid item>
                <FormControl fullWidth>
                  <Autocomplete
                    openOnFocus
                    value={
                      activityType === null ||
                      typeof activityType === 'undefined'
                        ? ''
                        : activityType
                    }
                    // Sort none to top
                    options={Object.values(ActivityTypeEnum).sort((a) =>
                      a === ActivityTypeEnum.None ? -1 : 1,
                    )}
                    getOptionLabel={(activity) => {
                      if (activity === ActivityTypeEnum.None) {
                        return t('None');
                      } else {
                        return getLocalizedTaskType(
                          t,
                          activity as ActivityTypeEnum,
                        );
                      }
                    }}
                    renderInput={(params): ReactElement => (
                      <TextField {...params} label={t('Action')} />
                    )}
                    onChange={(_, activity): void => {
                      setFieldValue(
                        'activityType',
                        activity === ActivityTypeEnum.None ? null : activity,
                      );
                    }}
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
                    inputProps={{ 'aria-label': 'Location' }}
                  />
                </Grid>
              )}
              <Grid item>
                {!loading ? (
                  <Autocomplete
                    options={
                      data?.accountListUsers?.nodes?.map(
                        ({ user }) => user.id,
                      ) ?? []
                    }
                    getOptionLabel={(userId): string => {
                      const user = data?.accountListUsers?.nodes.find(
                        ({ user }) => user.id === userId,
                      )?.user;
                      return `${user?.firstName} ${user?.lastName}`;
                    }}
                    renderInput={(params): ReactElement => (
                      <TextField {...params} label={t('Assignee')} />
                    )}
                    value={userId ?? null}
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
                          inputFormat={getDateFormatPattern()}
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
                          inputFormat={getDateFormatPattern()}
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
                {loadingFilteredById ? (
                  <CircularProgress color="primary" size={20} />
                ) : (
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
                    renderInput={(params): ReactElement => (
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
                    )}
                    value={contactIds ?? []}
                    onChange={(_, contactIds): void => {
                      setFieldValue('contactIds', contactIds);
                      setSelectedIds(contactIds);
                    }}
                    isOptionEqualToValue={(option, value): boolean =>
                      option === value
                    }
                  />
                )}
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
                          {getLocalizedTaskType(t, val)}
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
                  value={tagList ?? []}
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
                    inputProps={{ 'aria-label': 'Comment' }}
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
