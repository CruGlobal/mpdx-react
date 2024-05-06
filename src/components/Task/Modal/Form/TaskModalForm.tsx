import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import {
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { useSession } from 'next-auth/react';
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
  DisplayResultEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  PhaseEnum,
  ResultEnum,
  StatusEnum,
  TaskCreateInput,
  TaskUpdateInput,
} from 'src/graphql/types.generated';
import { useGetPhaseData } from 'src/hooks/useContactPhaseData';
import useTaskModal from 'src/hooks/useTaskModal';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';
import { nullableDateTime } from 'src/lib/formikHelpers';
import {
  getLocalizedNotificationTimeUnit,
  getLocalizedNotificationType,
} from 'src/utils/functions/getLocalizedNotificationStrings';
import { getLocalizedResultString } from 'src/utils/functions/getLocalizedResultStrings';
import { getValueFromIdValue } from 'src/utils/phases/getValueFromIdValue';
import { isAppointmentActivityType } from 'src/utils/phases/isAppointmentActivityType';
import theme from '../../../../theme';
import { DateTimeFieldPair } from '../../../common/DateTimePickers/DateTimeFieldPair';
import { GetTaskForTaskModalQuery } from '../TaskModalTask.generated';
import { FormFieldsGridContainer } from './Container/FormFieldsGridContainer';
import { ActivityTypeAutocomplete } from './Inputs/ActivityTypeAutocomplete/ActivityTypeAutocomplete';
import { AssigneeAutocomplete } from './Inputs/ActivityTypeAutocomplete/AssigneeAutocomplete/AssigneeAutocomplete';
import { ContactsAutocomplete } from './Inputs/ContactsAutocomplete/ContactsAutocomplete';
import { PhaseTags } from './Inputs/PhaseTags/PhaseTags';
import {
  TagTypeEnum,
  TagsAutocomplete,
} from './Inputs/TagsAutocomplete/TagsAutocomplete';
import { TaskPhaseAutocomplete } from './Inputs/TaskPhaseAutocomplete/TaskPhaseAutocomplete';
import { possibleNextActions } from './PossibleNextActions';
import { possiblePartnerStatus } from './PossiblePartnerStatus';
import { possibleResults } from './PossibleResults';
import {
  useCreateTasksMutation,
  useUpdateContactStatusMutation,
  useUpdateTaskMutation,
} from './TaskModal.generated';
import {
  getDatabaseValueFromResult,
  handleResultChange,
  handleTaskActionChange,
  handleTaskPhaseChange,
} from './TaskModalHelper';

const taskSchema = yup.object({
  taskPhase: yup.mixed<PhaseEnum>().nullable(),
  activityType: yup.mixed<ActivityTypeEnum>().nullable(),
  subject: yup.string().required(),
  startAt: nullableDateTime(),
  completedAt: nullableDateTime(),
  result: yup.mixed<ResultEnum>().nullable(),
  changeContactStatus: yup.boolean(),
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
  const session = useSession();
  const initialTask: Attributes = useMemo(
    () =>
      task
        ? {
            taskPhase: task.taskPhase ?? null,
            activityType: task.activityType ?? null,
            location: task.location ?? '',
            subject: task.subject ?? '',
            startAt: task.startAt ? DateTime.fromISO(task.startAt) : null,
            completedAt: task.completedAt
              ? DateTime.fromISO(task.completedAt)
              : null,
            result: task.result ?? null,
            changeContactStatus: false,
            nextAction: task.nextAction ?? null,
            tagList: task.tagList ?? [],
            contactIds: task.contacts.nodes.map(({ id }) => id),
            userId: task.user?.id ?? session.data?.user.userID ?? null,
            notificationTimeBefore: task.notificationTimeBefore,
            notificationType: task.notificationType,
            notificationTimeUnit: task.notificationTimeUnit,
            comment: '',
          }
        : {
            taskPhase: null,
            activityType: defaultValues?.activityType ?? null,
            location: '',
            subject: defaultValues?.subject ?? '',
            startAt: DateTime.local(),
            completedAt: null,
            result: defaultValues?.result ?? null,
            changeContactStatus: false,
            nextAction: defaultValues?.nextAction ?? null,
            tagList: defaultValues?.tagList ?? [],
            contactIds: defaultValues?.contactIds ?? [],
            userId: defaultValues?.userId ?? session.data?.user.userID ?? null,
            notificationTimeBefore: null,
            notificationType: null,
            notificationTimeUnit: null,
            comment: '',
          },
    [],
  );

  const { t } = useTranslation();
  const { openTaskModal } = useTaskModal();
  const [removeDialogOpen, handleRemoveDialog] = useState(false);
  // TODO replace with ResultEnum when available
  const [resultSelected, setResultSelected] =
    useState<DisplayResultEnum | null>(
      (task?.result as unknown as DisplayResultEnum) || null,
    );
  // TODO - Need to fix the above ^

  const [actionSelected, setActionSelected] = useState<ActivityTypeEnum | null>(
    task?.activityType || null,
  );

  const { enqueueSnackbar } = useSnackbar();

  const { phaseData, setPhaseId, constants, taskPhases } = useGetPhaseData(
    task?.taskPhase,
  );
  const [selectedSuggestedTags, setSelectedSuggestedTags] = useState<string[]>(
    [],
  );

  const [createTasks, { loading: creating }] = useCreateTasksMutation();
  const [updateTask, { loading: saving }] = useUpdateTaskMutation();
  const [updateContactStatus] = useUpdateContactStatusMutation();
  const { update } = useUpdateTasksQueries();

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!task && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const onSubmit = async (
    { comment, completedAt, startAt, ...attributes }: Attributes,
    suggestedPartnerStatus?: StatusEnum | null,
  ): Promise<void> => {
    const updatingContactStatus =
      attributes.changeContactStatus && !!suggestedPartnerStatus;
    // TODO - remove this when Caleb and the API has been
    delete attributes.taskPhase;
    delete attributes.changeContactStatus;

    const sharedAttributes = {
      ...attributes,
      completedAt: completedAt?.toISO(),
      startAt: startAt?.toISO(),
    };

    if (attributes.result) {
      attributes.result = getDatabaseValueFromResult(
        phaseData,
        attributes.result,
        attributes.activityType,
      );
    }

    if (task) {
      await updateTask({
        variables: {
          accountListId,
          attributes: { id: task.id, ...sharedAttributes },
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
    if (updatingContactStatus) {
      try {
        await Promise.all(
          attributes.contactIds.map((contactID) =>
            updateContactStatus({
              variables: {
                accountListId,
                attributes: {
                  id: contactID,
                  status: suggestedPartnerStatus,
                },
              },
            }),
          ),
        );
        enqueueSnackbar(t('Updated contact(s) status successfully'), {
          variant: 'success',
        });
      } catch {
        enqueueSnackbar(t('Error while updating contact(s) status'), {
          variant: 'error',
        });
      }
    }
    update();
    enqueueSnackbar(t('Task(s) saved successfully'), { variant: 'success' });
    onClose();
    if (attributes.nextAction && attributes.nextAction !== task?.nextAction) {
      openTaskModal({
        view: 'add',
        defaultValues: {
          subject: attributes.subject,
          activityType: attributes.nextAction,
          contactIds: attributes.contactIds,
          userId: task?.user?.id,
          tagList: task?.tagList,
        },
      });
    }
  };

  const availableResults = useMemo(
    () => possibleResults(phaseData),
    [phaseData],
  );

  const partnerStatus = useMemo(
    () => possiblePartnerStatus(phaseData, resultSelected, actionSelected),
    [phaseData, resultSelected, actionSelected],
  );

  const nextActions = useMemo(
    () => possibleNextActions(phaseData, resultSelected, actionSelected),
    [phaseData, resultSelected, actionSelected],
  );

  const phaseTags = useMemo(
    () =>
      phaseData?.results?.tags?.map((tag) => getValueFromIdValue(tag)) || [],
    [phaseData],
  );

  return (
    <Formik
      initialValues={initialTask}
      validationSchema={taskSchema}
      onSubmit={async (values) => {
        await onSubmit(values, partnerStatus?.suggestedContactStatus);
      }}
      validateOnMount
      enableReinitialize
    >
      {({
        values: {
          taskPhase,
          activityType,
          subject,
          startAt,
          completedAt,
          result,
          changeContactStatus,
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
                <TaskPhaseAutocomplete
                  options={taskPhases}
                  label={t('Task Type/Phase')}
                  value={taskPhase}
                  contactPhase={phaseData?.id}
                  inputRef={inputRef}
                  onChange={(phase) =>
                    handleTaskPhaseChange({
                      phase,
                      setFieldValue,
                      setResultSelected,
                      setActionSelected,
                      setPhaseId,
                      setSelectedSuggestedTags,
                    })
                  }
                />
              </Grid>

              <Grid item>
                <FormControl fullWidth>
                  <ActivityTypeAutocomplete
                    options={Object.values(ActivityTypeEnum)}
                    label={t('Action')}
                    value={activityType}
                    taskPhaseType={taskPhase}
                    onChange={(activityType) => {
                      handleTaskActionChange({
                        activityType,
                        setFieldValue,
                        setActionSelected,
                        constants,
                      });
                    }}
                  />
                </FormControl>
              </Grid>

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
                />
              </Grid>
              {isAppointmentActivityType(activityType) && (
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
                    <DateTimeFieldPair
                      render={(dateField, timeField) => (
                        <Grid container spacing={2}>
                          <Grid xs={6} item>
                            {dateField}
                          </Grid>
                          <Grid xs={6} item>
                            {timeField}
                          </Grid>
                        </Grid>
                      )}
                      dateLabel={t('Due Date')}
                      timeLabel={t('Due Time')}
                      value={startAt}
                      onChange={(startAt) => setFieldValue('startAt', startAt)}
                    />
                  </FormControl>
                </Grid>
              )}
              {initialTask.completedAt && (
                <Grid item>
                  <FormControl fullWidth>
                    <DateTimeFieldPair
                      render={(dateField, timeField) => (
                        <Grid container spacing={2}>
                          <Grid xs={6} item>
                            {dateField}
                          </Grid>
                          <Grid xs={6} item>
                            {timeField}
                          </Grid>
                        </Grid>
                      )}
                      dateLabel={t('Completed Date')}
                      timeLabel={t('Completed Time')}
                      value={completedAt}
                      onChange={(completedAt) =>
                        setFieldValue('completedAt', completedAt)
                      }
                    />
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
              {initialTask.completedAt && !!availableResults.length && (
                <Grid item>
                  <FormControl fullWidth required>
                    <InputLabel id="result">{t('Result')}</InputLabel>
                    <Select
                      labelId="result"
                      label={t('Result')}
                      value={result}
                      onChange={(e) => {
                        handleResultChange({
                          result: e.target.value,
                          setFieldValue,
                          setResultSelected,
                        });
                      }}
                    >
                      {availableResults.map((result) => (
                        <MenuItem key={result} value={result}>
                          {getLocalizedResultString(t, result)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {partnerStatus?.suggestedContactStatus && (
                <Grid item>
                  <FormControl fullWidth>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={changeContactStatus}
                          name="changeContactStatus"
                          onChange={handleChange}
                        />
                      }
                      label={t("Change the contact's status to: {{status}}", {
                        status: partnerStatus.suggestedContactStatus,
                      })}
                    />
                    {contactIds.length > 1 && (
                      <FormHelperText>
                        {t(
                          'This will change the contact status for {{amount}} contacts',
                          {
                            amount: contactIds.length,
                          },
                        )}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              )}
              {initialTask.completedAt && nextActions.length > 0 && (
                <Grid item>
                  <ActivityTypeAutocomplete
                    options={nextActions}
                    label={t('Next Action')}
                    value={nextAction}
                    onChange={(nextAction) =>
                      setFieldValue('nextAction', nextAction)
                    }
                  />
                </Grid>
              )}
              {!!phaseTags?.length && (
                <PhaseTags
                  tags={phaseTags}
                  selectedTags={selectedSuggestedTags}
                  setSelectedTags={setSelectedSuggestedTags}
                />
              )}
              <Grid item xs={12}>
                <TagsAutocomplete
                  accountListId={accountListId}
                  type={TagTypeEnum.Tag}
                  value={tagList ?? []}
                  onChange={(tagList) => setFieldValue('tagList', tagList)}
                  label={phaseTags?.length ? t('Additional Tags') : ''}
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
