import React, { ReactElement, useCallback, useState } from 'react';
import {
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Grid,
  CircularProgress,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Dialog,
  InputAdornment,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Schedule from '@mui/icons-material/Schedule';
import { useTranslation } from 'react-i18next';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import { debounce } from 'lodash/fp';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  TaskCreateInput,
  TaskUpdateInput,
  ResultEnum,
} from '../../../../../../graphql/types.generated';
import { GetThisWeekDocument } from '../../../../Dashboard/ThisWeek/GetThisWeek.generated';
import {
  useGetDataForTaskModalQuery,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTaskModalContactsFilteredQuery,
  useUpdateTaskLocationMutation,
} from '../../../Modal/Form/TaskModal.generated';
import theme from '../../../../../../src/theme';
import { useCreateTaskCommentMutation } from '../../../Modal/Comments/Form/CreateTaskComment.generated';
import { FormFieldsGridContainer } from '../Container/FormFieldsGridContainer';
import useTaskModal from 'src/hooks/useTaskModal';
import { ContactTasksTabDocument } from 'src/components/Contacts/ContactDetails/ContactTasksTab/ContactTasksTab.generated';
import { TasksDocument } from 'pages/accountLists/[accountListId]/tasks/Tasks.generated';
import {
  SubmitButton,
  CancelButton,
  DeleteButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import { getLocalizedResultString } from 'src/utils/functions/getLocalizedResultStrings';
import { possibleNextActions } from '../PossibleNextActions';
import { possibleResults } from '../PossibleResults';
import { GetTaskForTaskModalQuery } from '../../TaskModalTask.generated';
import { TaskLocation } from '../TaskModalForm';

const LoadingIndicator = styled(CircularProgress)(() => ({
  display: 'flex',
  margin: 'auto',
}));

const taskSchema: yup.SchemaOf<
  TaskCreateInput | TaskUpdateInput | TaskLocation
> = yup.object({
  id: yup.string().nullable(),
  activityType: yup.mixed<ActivityTypeEnum>(),
  subject: yup.string().required(),
  contactIds: yup.array().of(yup.string()).default([]),
  starred: yup.boolean().nullable(),
  startAt: yup.string().nullable(),
  completedAt: yup.string().nullable(),
  userId: yup.string().nullable(),
  tagList: yup.array().of(yup.string()).default([]),
  notificationTimeBefore: yup.number().nullable(),
  notificationType: yup.mixed<NotificationTypeEnum>(),
  result: yup.mixed<ResultEnum>(),
  nextAction: yup.mixed<ActivityTypeEnum>(),
  notificationTimeUnit: yup.mixed<NotificationTimeUnitEnum>(),
  location: yup.string().nullable(),
});

interface Props {
  accountListId: string;
  task?: (GetTaskForTaskModalQuery['task'] & TaskLocation) | null;
  onClose: () => void;
  defaultValues?: Partial<TaskCreateInput>;
}

interface NextActionsSectionProps {
  activityType: ActivityTypeEnum;
  nextAction: ActivityTypeEnum | undefined | null;
  setFieldValue: (
    field: string,
    value: string | null,
    shouldValidate?: boolean | undefined,
  ) => void;
}

const NextActionsSection: React.FC<NextActionsSectionProps> = ({
  activityType,
  nextAction,
  setFieldValue,
}) => {
  const { t } = useTranslation();
  const availableNextActions = possibleNextActions(activityType);
  return (
    <>
      {availableNextActions.length > 0 && (
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="nextAction">{t('Next Action')}</InputLabel>
            <Select
              labelId="nextAction"
              label={t('Next Action')}
              value={nextAction}
              onChange={(e) => setFieldValue('nextAction', e.target.value)}
            >
              <MenuItem value={ActivityTypeEnum.None}>{t('None')}</MenuItem>
              {availableNextActions
                .filter((val) => val !== 'NONE')
                .map((val) => (
                  <MenuItem key={val} value={val}>
                    {getLocalizedTaskType(t, val)}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
      )}
    </>
  );
};

const TaskModalLogForm = ({
  accountListId,
  task,
  onClose,
  defaultValues,
}: Props): ReactElement => {
  const initialTask: TaskCreateInput & TaskLocation = task
    ? {
        ...(({ user: _user, contacts: _contacts, ...task }) => task)(task),
        contactIds: task.contacts.nodes.map(({ id }) => id),
      }
    : {
        id: null,
        activityType: null,
        subject: '',
        location: null,
        startAt: null,
        completedAt: DateTime.local()
          .plus({ hours: 1 })
          .startOf('hour')
          .toISO(),
        tagList: [],
        contactIds: [],
        notificationTimeBefore: null,
        notificationType: null,
        notificationTimeUnit: null,
        result: ResultEnum.Done,
        nextAction: null,
        ...defaultValues,
      };
  const { t } = useTranslation();
  const [commentBody, setCommentBody] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const { openTaskModal } = useTaskModal();

  const { data, loading } = useGetDataForTaskModalQuery({
    variables: { accountListId },
  });
  const [createTask, { loading: creating }] = useCreateTaskMutation();
  const [deleteTask, { loading: deleting }] = useDeleteTaskMutation();
  const [createTaskComment] = useCreateTaskCommentMutation();
  const [updateTaskLocation] = useUpdateTaskLocationMutation();

  const handleSearchTermChange = useCallback(
    debounce(500, (event) => {
      setSearchTerm(event.target.value);
    }),
    [],
  );

  const onSubmit = async (
    attributes: TaskCreateInput & TaskLocation,
  ): Promise<void> => {
    const body = commentBody.trim();
    //TODO: Delete all location related stuff when field gets added to rails schema
    const location = attributes.location;
    delete attributes.location;
    const { data } = await createTask({
      variables: { accountListId, attributes },
      update: (_cache, { data }) => {
        if (data?.createTask?.task.id && location) {
          updateTaskLocation({
            variables: {
              taskId: data?.createTask?.task.id,
              location,
            },
          });
        }
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
    enqueueSnackbar(t('Task logged successfully'), { variant: 'success' });
    onClose();
    if (
      attributes.nextAction &&
      attributes.nextAction !== ActivityTypeEnum.None
    ) {
      openTaskModal({
        defaultValues: {
          activityType: attributes.nextAction,
          // TODO: Use fragments to ensure all required fields are loaded
          contactIds:
            data?.createTask?.task?.contacts?.nodes.map(
              (contact) => contact.id,
            ) || [],
          userId: data?.createTask?.task.user?.id,
          tagList: data?.createTask?.task.tagList,
        },
      });
    }
  };

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
            query: GetThisWeekDocument,
            variables: {
              accountListId,
              endOfDay: endOfDay.toISO(),
              today: endOfDay.toISODate(),
              threeWeeksFromNow: endOfDay.plus({ weeks: 3 }).toISODate(),
              twoWeeksAgo: endOfDay.minus({ weeks: 2 }).toISODate(),
            },
          },
        ],
      });
      enqueueSnackbar(t('Task deleted successfully'), { variant: 'success' });
      setRemoveDialogOpen(false);
      onClose();
    }
  };

  const handleShowMoreChange = (): void => {
    setShowMore((prevState) => !prevState);
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
          userId,
          completedAt,
          tagList,
          contactIds,
          result,
          nextAction,
          location,
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
                    label={t('Action')}
                    value={activityType}
                    onChange={(e) =>
                      setFieldValue('activityType', e.target.value)
                    }
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
                                <CircularProgress
                                  color="primary"
                                  size={20}
                                  data-testid="loading"
                                />
                              )}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    value={contactIds ?? undefined}
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
              <Grid item>
                <FormControl fullWidth>
                  <InputLabel id="result">{t('Result')}</InputLabel>
                  <Select
                    labelId="result"
                    label={t('Result')}
                    value={result}
                    onChange={(e) => setFieldValue('result', e.target.value)}
                  >
                    {activityType ? (
                      possibleResults(activityType)
                        .filter((val) => val !== 'NONE')
                        .map((val) => (
                          <MenuItem key={val} value={val}>
                            {getLocalizedResultString(t, val)}
                          </MenuItem>
                        ))
                    ) : (
                      <MenuItem value={ResultEnum.Done}>
                        {getLocalizedResultString(t, ResultEnum.Done)}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl fullWidth>
                  <Grid container spacing={2}>
                    <Grid xs={6} item>
                      <MobileDatePicker
                        renderInput={(params) => (
                          <TextField fullWidth {...params} />
                        )}
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
              <Grid item>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showMore}
                      onChange={handleShowMoreChange}
                    />
                  }
                  label={t('Show More')}
                />
                <AnimatePresence>
                  {showMore && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 193, opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <Grid
                        item
                        container
                        spacing={2}
                        style={{ marginBottom: 16 }}
                      >
                        <Grid item xs={12}>
                          <TextField
                            label={t('Comment')}
                            value={commentBody}
                            onChange={(event) =>
                              setCommentBody(event.target.value)
                            }
                            fullWidth
                            multiline
                            inputProps={{ 'aria-label': 'Comment' }}
                          />
                        </Grid>
                        <Grid item xs={12}>
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
                        <Grid item xs={12}>
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
                                        <CircularProgress
                                          color="primary"
                                          size={20}
                                        />
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
                        </Grid>
                        {activityType && (
                          <NextActionsSection
                            activityType={activityType}
                            nextAction={nextAction}
                            setFieldValue={setFieldValue}
                          />
                        )}
                      </Grid>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Grid>
            </FormFieldsGridContainer>
          </DialogContent>
          <DialogActions>
            {task?.id ? (
              <DeleteButton onClick={() => setRemoveDialogOpen(true)} />
            ) : null}
            <CancelButton disabled={isSubmitting} onClick={onClose} />
            <SubmitButton disabled={!isValid || isSubmitting}>
              {creating && (
                <>
                  <CircularProgress color="primary" size={20} />
                  &nbsp;
                </>
              )}
              {t('Save')}
            </SubmitButton>

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
                <CancelButton onClick={() => setRemoveDialogOpen(false)}>
                  {t('No')}
                </CancelButton>
                <SubmitButton type="button" onClick={onDeleteTask}>
                  {t('Yes')}
                </SubmitButton>
              </DialogActions>
            </Dialog>
          </DialogActions>
        </form>
      )}
    </Formik>
  );
};

export default TaskModalLogForm;
