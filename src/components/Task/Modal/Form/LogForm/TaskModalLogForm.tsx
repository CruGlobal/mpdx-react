import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
} from '@mui/material';
import { Formik } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import { DateTime } from 'luxon';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import {
  ActivityTypeEnum,
  DisplayResultEnum,
  PhaseEnum,
  ResultEnum,
  StatusEnum,
  TaskCreateInput,
} from 'src/graphql/types.generated';
import { usePhaseData } from 'src/hooks/usePhaseData';
import useTaskModal from 'src/hooks/useTaskModal';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';
import { dispatch } from 'src/lib/analytics';
import { nullableDateTime } from 'src/lib/formikHelpers';
import { getValueFromIdValue } from 'src/utils/phases/getValueFromIdValue';
import { inPersonActivityTypes } from 'src/utils/phases/taskActivityTypes';
import { DateTimeFieldPair } from '../../../../common/DateTimePickers/DateTimeFieldPair';
import { TaskModalEnum } from '../../TaskModal';
import { FormFieldsGridContainer } from '../Container/FormFieldsGridContainer';
import { ActivityTypeAutocomplete } from '../Inputs/ActivityTypeAutocomplete/ActivityTypeAutocomplete';
import { AssigneeAutocomplete } from '../Inputs/ActivityTypeAutocomplete/AssigneeAutocomplete/AssigneeAutocomplete';
import { ContactsAutocomplete } from '../Inputs/ContactsAutocomplete/ContactsAutocomplete';
import { PhaseTags } from '../Inputs/PhaseTags/PhaseTags';
import { ResultAutocomplete } from '../Inputs/ResultAutocomplete/ResultAutocomplete';
import { SuggestedContactStatus } from '../Inputs/SuggestedContactStatus/SuggestedContactStatus';
import {
  TagTypeEnum,
  TagsAutocomplete,
} from '../Inputs/TagsAutocomplete/TagsAutocomplete';
import { TaskPhaseAutocomplete } from '../Inputs/TaskPhaseAutocomplete/TaskPhaseAutocomplete';
import { possibleNextActions } from '../PossibleNextActions';
import { possiblePartnerStatus } from '../PossiblePartnerStatus';
import { possibleResults } from '../PossibleResults';
import {
  useCreateTasksMutation,
  useUpdateContactStatusMutation,
} from '../TaskModal.generated';
import {
  filterTags,
  getDatabaseValueFromResult,
  handleTaskActionChange,
  handleTaskPhaseChange,
} from '../TaskModalHelper';

const taskSchema = yup.object({
  taskPhase: yup.mixed<PhaseEnum>().nullable(),
  activityType: yup.mixed<ActivityTypeEnum>().required().default(undefined),
  subject: yup.string().required(),
  contactIds: yup.array().of(yup.string()).default([]),
  completedAt: nullableDateTime(),
  userId: yup.string().nullable(),
  tagList: yup.array().of(yup.string()).default([]),
  displayResult: yup.mixed<DisplayResultEnum>(),
  result: yup.mixed<ResultEnum>(),
  changeContactStatus: yup.boolean(),
  nextAction: yup.mixed<ActivityTypeEnum>().nullable(),
  // These field schemas should ideally be string().defined(), but Formik thinks the form is invalid
  // when those fields fields are blank for some reason, and we need to allow blank values
  location: yup.string(),
  comment: yup.string(),
});
type Attributes = yup.InferType<typeof taskSchema>;

interface Props {
  accountListId: string;
  onClose: () => void;
  defaultValues?: Partial<TaskCreateInput> & {
    taskPhase?: PhaseEnum;
    contactNodes?: [{ id: string; status: StatusEnum | undefined }];
  };
  showFlowsMessage?: boolean;
}

const TaskModalLogForm = ({
  accountListId,
  onClose,
  defaultValues,
  showFlowsMessage = false,
}: Props): ReactElement => {
  const session = useSession();
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  // TODO replace with ResultEnum when available
  const [resultSelected, setResultSelected] =
    useState<DisplayResultEnum | null>(
      (defaultValues?.result as unknown as DisplayResultEnum) || null,
    );

  const [actionSelected, setActionSelected] = useState<
    ActivityTypeEnum | undefined
  >(defaultValues?.activityType || undefined);

  const { enqueueSnackbar } = useSnackbar();
  const { openTaskModal } = useTaskModal();
  const {
    phaseData,
    setPhaseId,
    constants,
    taskPhases,
    activityTypes,
    activitiesByPhase,
  } = usePhaseData();
  const [selectedSuggestedTags, setSelectedSuggestedTags] = useState<string[]>(
    [],
  );

  const [createTasks, { loading: creating }] = useCreateTasksMutation();
  const [updateContactStatus] = useUpdateContactStatusMutation();
  const { update } = useUpdateTasksQueries();
  const activityRef = useRef<HTMLInputElement | null>(null);
  const firstFocusRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (firstFocusRef.current) {
      setTimeout(
        () => firstFocusRef?.current && firstFocusRef?.current.focus(),
        500,
      );
    }
  }, []);

  const initialTask: Attributes = useMemo(() => {
    let taskPhase: PhaseEnum | null = defaultValues?.taskPhase ?? null;
    let taskSubject = defaultValues?.subject;

    if (defaultValues?.activityType && activityTypes) {
      const activityData = defaultValues.activityType
        ? activityTypes.get(defaultValues.activityType)
        : undefined;
      if (activityData) {
        setPhaseId(activityData.phaseId);
        taskPhase = activityData.phaseId;
        taskSubject = activityData.title;
      }
    }
    if (defaultValues?.taskPhase) {
      setPhaseId(defaultValues?.taskPhase);
    }

    return {
      taskPhase: taskPhase,
      activityType: defaultValues?.activityType ?? undefined,
      subject: taskSubject ?? '',
      contactIds: defaultValues?.contactIds ?? [],
      completedAt: DateTime.local(),
      userId: defaultValues?.userId ?? session.data?.user.userID ?? null,
      tagList: defaultValues?.tagList ?? [],
      displayResult: defaultValues?.displayResult ?? undefined,
      result: defaultValues?.result ?? undefined,
      changeContactStatus: false,
      nextAction: defaultValues?.nextAction ?? undefined,
      location: '',
      comment: '',
    };
  }, []);

  const onSubmit = async (
    { completedAt, comment, ...attributes }: Attributes,
    suggestedPartnerStatus?: StatusEnum | null,
  ): Promise<void> => {
    if (selectedSuggestedTags.length) {
      attributes.tagList = attributes.tagList.concat(selectedSuggestedTags);
    }

    if (attributes.displayResult) {
      attributes.result = getDatabaseValueFromResult(
        phaseData,
        attributes.displayResult,
        attributes.activityType || undefined,
      );
    }

    // TODO - remove this when Caleb and the API has been
    delete attributes.taskPhase;
    // TODO - remove this when NewResultEnum are added
    attributes.result = ResultEnum.Completed;

    const updatingContactStatus =
      attributes.changeContactStatus && !!suggestedPartnerStatus;

    delete attributes.changeContactStatus;

    await createTasks({
      variables: {
        accountListId,
        attributes: {
          ...attributes,
          completedAt: completedAt?.toISO(),
          comment: comment?.trim(),
        },
      },
      refetchQueries: ['ContactTasksTab', 'GetWeeklyActivity'],
    });

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
    if (attributes.contactIds && attributes.contactIds.length > 1) {
      attributes.contactIds.forEach(() => {
        dispatch('mpdx-task-completed');
      });
    } else {
      dispatch('mpdx-task-completed');
    }
    enqueueSnackbar(t('Task(s) logged successfully'), { variant: 'success' });
    onClose();
    if (attributes.nextAction) {
      openTaskModal({
        view: TaskModalEnum.Add,
        defaultValues: {
          activityType: attributes.nextAction,
          // TODO: Use fragments to ensure all required fields are loaded
          contactIds: attributes.contactIds,
          userId: attributes.userId ?? undefined,
          tagList: filterTags(attributes?.tagList, phaseTags)?.additionalTags,
        },
      });
    }
  };

  const handleShowMoreChange = (): void => {
    setShowMore((prevState) => !prevState);
  };

  const availableResults = useMemo(
    () => possibleResults(phaseData),
    [phaseData],
  );
  const partnerStatus = useMemo(
    () =>
      possiblePartnerStatus(
        phaseData,
        resultSelected,
        actionSelected || undefined,
      ),
    [phaseData, resultSelected, actionSelected],
  );

  const nextActions = useMemo(
    () =>
      possibleNextActions(
        phaseData,
        resultSelected,
        actionSelected || undefined,
      ),
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
      validateOnChange
    >
      {({
        values: {
          taskPhase,
          activityType,
          subject,
          userId,
          completedAt,
          tagList,
          contactIds,
          displayResult,
          changeContactStatus,
          nextAction,
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
                  "The contact's status has been updated. Now you can log the task that motivated this change.",
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
                      inputRef={firstFocusRef}
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
                    />
                  </Grid>
                  <Grid xs={12} sm={6} item>
                    <ActivityTypeAutocomplete
                      options={
                        (taskPhase && activitiesByPhase.get(taskPhase)) || []
                      }
                      label={t('Action')}
                      value={activityType || undefined}
                      onChange={(
                        activityType: ActivityTypeEnum | undefined,
                      ) => {
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

              <ResultAutocomplete
                availableResults={availableResults}
                result={displayResult}
                setFieldValue={setFieldValue}
                setResultSelected={setResultSelected}
                phaseData={phaseData}
              />
              <SuggestedContactStatus
                suggestedContactStatus={partnerStatus?.suggestedContactStatus}
                changeContactStatus={changeContactStatus}
                handleChange={handleChange}
                accountListId={accountListId}
                contactIds={contactIds}
              />
              {!!phaseTags?.length && (
                <Grid item>
                  <PhaseTags
                    tags={phaseTags}
                    selectedTags={selectedSuggestedTags}
                    setSelectedTags={setSelectedSuggestedTags}
                  />
                </Grid>
              )}
              {activityType && nextActions.length > 0 && (
                <Grid item xs={12}>
                  <ActivityTypeAutocomplete
                    options={nextActions}
                    label={t('Next Action')}
                    value={nextAction || undefined}
                    onChange={(nextAction) =>
                      setFieldValue('nextAction', nextAction)
                    }
                    activityTypes={activityTypes}
                  />
                </Grid>
              )}
              <Grid item>
                <ContactsAutocomplete
                  accountListId={accountListId}
                  value={contactIds}
                  onChange={(contactIds) => {
                    setFieldValue('contactIds', contactIds);
                  }}
                />
              </Grid>
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
                      animate={{ height: 216, opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <Grid
                        item
                        container
                        spacing={2}
                        style={{ marginBottom: 16 }}
                      >
                        <Grid item xs={12}>
                          <TagsAutocomplete
                            accountListId={accountListId}
                            type={TagTypeEnum.Tag}
                            value={tagList ?? []}
                            onChange={(tagList) =>
                              setFieldValue('tagList', tagList)
                            }
                            label={
                              phaseTags?.length ? t('Additional Tags') : ''
                            }
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            label={t('Comment')}
                            value={comment}
                            onChange={handleChange('comment')}
                            fullWidth
                            multiline
                            inputProps={{ 'aria-label': t('Comment') }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <AssigneeAutocomplete
                            accountListId={accountListId}
                            value={userId}
                            onChange={(userId) =>
                              setFieldValue('userId', userId)
                            }
                          />
                        </Grid>
                      </Grid>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Grid>
            </FormFieldsGridContainer>
          </DialogContent>
          <DialogActions>
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
          </DialogActions>
        </form>
      )}
    </Formik>
  );
};

export default TaskModalLogForm;
