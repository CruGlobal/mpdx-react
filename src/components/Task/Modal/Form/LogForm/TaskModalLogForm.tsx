import React, { ReactElement, useCallback, useState } from 'react';
import {
  Autocomplete,
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
  FormControlLabel,
  Switch,
} from '@mui/material';
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
import { dateFormat } from '../../../../../lib/intlFormat/intlFormat';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  TaskCreateInput,
  TaskUpdateInput,
  ResultEnum,
} from '../../../../../../graphql/types.generated';
import { GetTaskForTaskDrawerQuery } from '../../../Drawer/TaskDrawerTask.generated';
import { GetTasksForTaskListDocument } from '../../../List/TaskList.generated';
import { TaskFilter } from '../../../List/List';
import { GetThisWeekDocument } from '../../../../Dashboard/ThisWeek/GetThisWeek.generated';
import {
  useGetDataForTaskDrawerQuery,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTaskModalContactsFilteredQuery,
} from '../../../Drawer/Form/TaskDrawer.generated';
import theme from '../../../../../../src/theme';
import { useCreateTaskCommentMutation } from '../../../Drawer/CommentList/Form/CreateTaskComment.generated';
import { FormFieldsWrapper } from '../TaskModalForm';
import { FormFieldsGridContainer } from '../Container/FormFieldsGridContainer';
import useTaskModal from 'src/hooks/useTaskModal';
import { ContactTasksTabDocument } from 'src/components/Contacts/ContactDetails/ContactTasksTab/ContactTasksTab.generated';
import { TasksDocument } from 'pages/accountLists/[accountListId]/tasks/Tasks.generated';
import { ModalDeleteButton } from 'src/components/common/Modal/DeleteButton/ModalDeleteButton';

export const ActionButton = styled(Button)(() => ({
  color: theme.palette.info.main,
  fontWeight: 550,
}));

const LoadingIndicator = styled(CircularProgress)(() => ({
  display: 'flex',
  margin: 'auto',
}));

const taskSchema: yup.SchemaOf<TaskCreateInput | TaskUpdateInput> = yup.object({
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
});

interface Props {
  accountListId: string;
  task?: GetTaskForTaskDrawerQuery['task'];
  onClose: () => void;
  defaultValues?: Partial<TaskCreateInput>;
  filter?: TaskFilter;
  rowsPerPage: number;
}

const TaskModalLogForm = ({
  accountListId,
  task,
  onClose,
  defaultValues,
  filter,
  rowsPerPage,
}: Props): ReactElement => {
  const initialTask: TaskCreateInput = task
    ? {
        ...(({ user: _user, contacts: _contacts, ...task }) => task)(task),
        contactIds: task.contacts.nodes.map(({ id }) => id),
      }
    : {
        id: null,
        activityType: null,
        subject: '',
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
        result: null,
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

  const { data, loading } = useGetDataForTaskDrawerQuery({
    variables: { accountListId },
  });
  const [createTask, { loading: creating }] = useCreateTaskMutation();
  const [deleteTask, { loading: deleting }] = useDeleteTaskMutation();
  const [createTaskComment] = useCreateTaskCommentMutation();

  const handleSearchTermChange = useCallback(
    debounce(500, (event) => {
      setSearchTerm(event.target.value);
    }),
    [],
  );

  const onSubmit = async (attributes: TaskCreateInput): Promise<void> => {
    const body = commentBody.trim();
    const { data } = await createTask({
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
            query: GetTasksForTaskListDocument,
            variables: { accountListId, first: rowsPerPage, ...filter },
          },
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
    <Box>
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
                      label={t('Action')}
                      value={activityType}
                      onChange={handleChange('activityType')}
                    >
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
                  <FormControl fullWidth>
                    <InputLabel id="result">{t('Result')}</InputLabel>
                    <Select
                      labelId="result"
                      label={t('Result')}
                      value={result}
                      onChange={handleChange('result')}
                    >
                      {Object.values(ResultEnum).map((val) => (
                        <MenuItem key={val} value={val}>
                          {t(val) /* manually added to translation file */}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item>
                  <FormControl fullWidth>
                    <Grid container spacing={2}>
                      <Grid xs={6} item>
                        <MobileDatePicker
                          renderInput={(params) => <TextField {...params} />}
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
                          closeOnSelect
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
                        <MobileTimePicker
                          renderInput={(params) => <TextField {...params} />}
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
                          clearable
                          fullWidth
                          closeOnSelect
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
                        <Grid item container>
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
                              renderTags={(
                                value,
                                getTagProps,
                              ): ReactElement[] =>
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
                              getOptionSelected={(option, value): boolean =>
                                option === value
                              }
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControl fullWidth>
                              <InputLabel id="nextAction">
                                {t('Next Action')}
                              </InputLabel>
                              <Select
                                labelId="nextAction"
                                label={t('Next Action')}
                                value={nextAction}
                                onChange={handleChange('nextAction')}
                              >
                                {Object.values(ActivityTypeEnum).map((val) => (
                                  <MenuItem key={val} value={val}>
                                    {
                                      t(
                                        val,
                                      ) /* manually added to translation file */
                                    }
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                    size="large"
                    onClick={() => setRemoveDialogOpen(true)}
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
                  {creating && (
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
                  <Button onClick={() => setRemoveDialogOpen(false)}>
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

export default TaskModalLogForm;
