import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Autocomplete,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
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
import { usePhaseData } from 'src/hooks/usePhaseData';
import useTaskModal from 'src/hooks/useTaskModal';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';
import { nullableDateTime } from 'src/lib/formikHelpers';
import {
  getLocalizedNotificationTimeUnit,
  getLocalizedNotificationType,
} from 'src/utils/functions/getLocalizedNotificationStrings';
import { getValueFromIdValue } from 'src/utils/phases/getValueFromIdValue';
import { inPersonActivityTypes } from 'src/utils/phases/taskActivityTypes';
import theme from '../../../../theme';
import { DateTimeFieldPair } from '../../../common/DateTimePickers/DateTimeFieldPair';
import { TaskModalEnum } from '../TaskModal';
import { GetTaskForTaskModalQuery } from '../TaskModalTask.generated';
import { FormFieldsGridContainer } from './Container/FormFieldsGridContainer';
import { ActivityTypeAutocomplete } from './Inputs/ActivityTypeAutocomplete/ActivityTypeAutocomplete';
import { AssigneeAutocomplete } from './Inputs/ActivityTypeAutocomplete/AssigneeAutocomplete/AssigneeAutocomplete';
import { ContactsAutocomplete } from './Inputs/ContactsAutocomplete/ContactsAutocomplete';
import { PhaseTags } from './Inputs/PhaseTags/PhaseTags';
import { ResultAutocomplete } from './Inputs/ResultAutocomplete/ResultAutocomplete';
import { SuggestedContactStatus } from './Inputs/SuggestedContactStatus/SuggestedContactStatus';
import {
  TagTypeEnum,
  TagsAutocomplete,
} from './Inputs/TagsAutocomplete/TagsAutocomplete';
import { TaskPhaseAutocomplete } from './Inputs/TaskPhaseAutocomplete/TaskPhaseAutocomplete';
import { possibleNextActions } from './PossibleNextActions';
import {
  useCreateTasksMutation,
  useUpdateContactStatusMutation,
  useUpdateTaskMutation,
} from './TaskModal.generated';
import {
  extractSuggestedTags,
  getDatabaseValueFromResult,
  handleTaskActionChange,
  handleTaskPhaseChange,
} from './TaskModalHelper';
import { possiblePartnerStatus } from './possiblePartnerStatus';
import { possibleResults } from './possibleResults';

const taskSchema = yup.object({
  taskPhase: yup.mixed<PhaseEnum>().required().default(undefined),
  activityType: yup.mixed<ActivityTypeEnum>().required().default(undefined),
  subject: yup.string().required(),
  startAt: nullableDateTime(),
  completedAt: nullableDateTime(),
  displayResult: yup.mixed<DisplayResultEnum>().nullable(),
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
  defaultValues?: Partial<TaskCreateInput & TaskUpdateInput> & {
    taskPhase?: PhaseEnum;
  };
  showFlowsMessage?: boolean;
  view?: 'comments' | 'log' | 'add' | 'complete' | 'edit';
}

const TaskModalForm = ({
  accountListId,
  task,
  onClose,
  defaultValues,
  showFlowsMessage = false,
  view,
}: Props): ReactElement => {
  const session = useSession();

  const { t } = useTranslation();
  const { openTaskModal } = useTaskModal();
  const [removeDialogOpen, handleRemoveDialog] = useState(false);
  // TODO replace with ResultEnum when available
  const [resultSelected, setResultSelected] =
    useState<DisplayResultEnum | null>(
      (task?.result as unknown as DisplayResultEnum) ||
        defaultValues?.result ||
        null,
    );
  // TODO - Need to fix the above ^

  const [actionSelected, setActionSelected] = useState<
    ActivityTypeEnum | undefined
  >(task?.activityType || defaultValues?.activityType || undefined);

  const { enqueueSnackbar } = useSnackbar();

  const {
    phaseData,
    setPhaseId,
    constants,
    taskPhases,
    activityTypes,
    activitiesByPhase,
  } = usePhaseData(task?.taskPhase);

  const phaseTags = useMemo(
    () =>
      phaseData?.results?.tags?.map((tag) => getValueFromIdValue(tag)) || [],
    [phaseData],
  );

  const [selectedSuggestedTags, setSelectedSuggestedTags] = useState<string[]>(
    [],
  );

  const initialTask: Attributes = useMemo(() => {
    if (task) {
      let taskPhase = task?.taskPhase;
      if (!taskPhase) {
        taskPhase = task?.activityType
          ? activityTypes.get(task.activityType)?.phaseId || undefined
          : undefined;
      }
      if (taskPhase) {
        setPhaseId(taskPhase);
      }

      //go through tags and move some to selectedSuggestedTags and others to additionalTags
      const filteredTags = extractSuggestedTags(task.tagList, phaseTags);
      const additionalTags = filteredTags?.additionalTags;
      setSelectedSuggestedTags((prevValues) => [
        ...prevValues,
        ...filteredTags?.suggestedTags,
      ]);

      return {
        taskPhase,
        activityType: task.activityType ?? undefined,
        location: task.location ?? '',
        subject: task.subject ?? '',
        startAt: task.startAt ? DateTime.fromISO(task.startAt) : null,
        completedAt: task.completedAt
          ? DateTime.fromISO(task.completedAt)
          : null,
        displayResult: task.displayResult ?? null,
        result: task.result ?? null,
        changeContactStatus: false,
        nextAction: task.nextAction ?? null,
        tagList: additionalTags ?? [],
        contactIds: task.contacts.nodes.map(({ id }) => id),
        userId: task.user?.id ?? session.data?.user.userID ?? null,
        notificationTimeBefore: task.notificationTimeBefore,
        notificationType: task.notificationType,
        notificationTimeUnit: task.notificationTimeUnit,
        comment: '',
      };
    } else {
      let taskPhase: PhaseEnum | undefined =
        defaultValues?.taskPhase || undefined;
      let taskSubject = defaultValues?.subject;

      if (defaultValues?.activityType && activityTypes) {
        const activityData = defaultValues.activityType
          ? activityTypes.get(defaultValues.activityType)
          : undefined;
        if (activityData) {
          taskPhase = activityData.phaseId;
          taskSubject = activityData.title;
        }
      }

      if (taskPhase) {
        setPhaseId(taskPhase);
      }

      return {
        taskPhase: taskPhase,
        activityType: defaultValues?.activityType ?? undefined,
        location: '',
        subject: taskSubject ?? '',
        startAt: DateTime.local(),
        completedAt: null,
        displayResult: null,
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
      };
    }
  }, [activityTypes]);

  const [createTasks, { loading: creating }] = useCreateTasksMutation();
  const [updateTask, { loading: saving }] = useUpdateTaskMutation();
  const [updateContactStatus] = useUpdateContactStatusMutation();
  const { update } = useUpdateTasksQueries();

  const activityRef = useRef<HTMLInputElement | null>(null);
  const firstFocusRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!task && firstFocusRef.current && !defaultValues?.activityType) {
      const timerId = setTimeout(() => firstFocusRef.current?.focus(), 500);
      return () => clearTimeout(timerId);
    }
  }, []);

  const onSubmit = async (
    {
      comment,
      completedAt,
      startAt,
      changeContactStatus,
      ...attributes
    }: Attributes,
    suggestedPartnerStatus?: StatusEnum | null,
  ): Promise<void> => {
    const updatingContactStatus =
      changeContactStatus && !!suggestedPartnerStatus;

    if (selectedSuggestedTags.length) {
      attributes.tagList = attributes.tagList.concat(selectedSuggestedTags);
    }

    if (attributes.displayResult) {
      attributes.result = getDatabaseValueFromResult(
        phaseData,
        attributes.displayResult,
        attributes.activityType,
      );
    }

    delete attributes.taskPhase;

    const sharedAttributes = {
      ...attributes,
      completedAt: completedAt?.toISO(),
      startAt: startAt?.toISO(),
    };

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
        view: TaskModalEnum.Add,
        defaultValues: {
          activityType: attributes.nextAction,
          contactIds: attributes.contactIds,
          userId: task?.user?.id,
          tagList: extractSuggestedTags(task?.tagList || [], phaseTags)
            ?.additionalTags,
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
          displayResult,
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
        setFieldTouched,
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
            {showFlowsMessage && (
              <Alert sx={{ marginBottom: 2 }}>
                {t(
                  "The contact's status has been updated. Now you can add a task to reflect your next step with this contact.",
                )}
              </Alert>
            )}
            <FormFieldsGridContainer>
              <Grid item>
                <Grid container spacing={2}>
                  <Grid xs={12} sm={6} item>
                    <TaskPhaseAutocomplete
                      options={taskPhases}
                      value={taskPhase}
                      contactPhase={phaseData?.id}
                      onChange={(phase) => {
                        handleTaskPhaseChange({
                          phase,
                          setFieldValue,
                          setResultSelected,
                          setActionSelected,
                          setPhaseId,
                          setSelectedSuggestedTags,
                        });
                        setTimeout(() => activityRef?.current?.focus(), 50);
                      }}
                      inputRef={firstFocusRef}
                      required
                      onBlur={handleBlur('taskPhase')}
                      touched={touched}
                      errors={errors}
                    />
                  </Grid>

                  <Grid xs={12} sm={6} item>
                    <FormControl fullWidth required>
                      <ActivityTypeAutocomplete
                        options={
                          (taskPhase && activitiesByPhase.get(taskPhase)) || []
                        }
                        label={t('Action')}
                        value={activityType}
                        onChange={(activityType) => {
                          handleTaskActionChange({
                            activityType,
                            setFieldValue,
                            setFieldTouched,
                            setActionSelected,
                            constants,
                          });
                        }}
                        inputRef={activityRef}
                        required
                        onBlur={handleBlur('activityType')}
                        touched={touched}
                        errors={errors}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
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
              {activityType && inPersonActivityTypes.includes(activityType) && (
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
              {initialTask.completedAt && (
                <ResultAutocomplete
                  availableResults={availableResults}
                  result={displayResult}
                  setFieldValue={setFieldValue}
                  setResultSelected={setResultSelected}
                  phaseData={phaseData}
                />
              )}

              <SuggestedContactStatus
                suggestedContactStatus={partnerStatus?.suggestedContactStatus}
                changeContactStatus={changeContactStatus}
                handleChange={handleChange}
                accountListId={accountListId}
                contactIds={contactIds}
              />

              {initialTask.completedAt && !!nextActions.length && (
                <Grid item>
                  <ActivityTypeAutocomplete
                    options={nextActions}
                    label={t('Next Action')}
                    value={nextAction || undefined}
                    onChange={(nextAction) =>
                      setFieldValue('nextAction', nextAction)
                    }
                  />
                </Grid>
              )}
              {!!phaseTags?.length && initialTask.completedAt && (
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
                  label={
                    phaseTags?.length && initialTask.completedAt
                      ? t('Additional Tags')
                      : ''
                  }
                />
              </Grid>
              <Grid item>
                <AssigneeAutocomplete
                  accountListId={accountListId}
                  value={userId}
                  onChange={(userId) => setFieldValue('userId', userId)}
                />
              </Grid>
              {!initialTask.completedAt && (
                <Grid item>
                  <Typography
                    style={{
                      display: 'flex',
                      marginBottom: theme.spacing(1),
                    }}
                  >
                    {t('Reminders')}
                    <Tooltip
                      placement="right"
                      title={t('If blank you will not be reminded')}
                    >
                      <InfoIcon style={{ marginLeft: '5px' }} />
                    </Tooltip>
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid xs={4} item>
                      <Tooltip
                        placement="top"
                        title={t('How the reminder will be sent')}
                      >
                        <Autocomplete
                          openOnFocus
                          autoHighlight
                          autoSelect
                          value={notificationType}
                          options={Object.values(NotificationTypeEnum)}
                          getOptionLabel={(value) =>
                            getLocalizedNotificationType(t, value)
                          }
                          renderInput={(params) => (
                            <TextField {...params} label={t('Type')} />
                          )}
                          onChange={(_, value) =>
                            setFieldValue('notificationType', value)
                          }
                        />
                      </Tooltip>
                    </Grid>
                    <Grid xs={3} item>
                      <Tooltip
                        placement="top"
                        title={t('Amount of time before reminder')}
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
                      <Tooltip
                        placement="top"
                        title={t('Days, hours, or minutes')}
                      >
                        <Autocomplete
                          openOnFocus
                          autoHighlight
                          autoSelect
                          value={notificationTimeUnit}
                          options={Object.values(NotificationTimeUnitEnum)}
                          getOptionLabel={(value) =>
                            getLocalizedNotificationTimeUnit(t, value)
                          }
                          renderInput={(params) => (
                            <TextField {...params} label={t('Unit')} />
                          )}
                          onChange={(_, value) =>
                            setFieldValue('notificationTimeUnit', value)
                          }
                        />
                      </Tooltip>
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
