import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
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
} from 'src/graphql/types.generated';
import { usePhaseData } from 'src/hooks/usePhaseData';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';
import { dispatch } from 'src/lib/analytics';
import { nullableDateTime } from 'src/lib/formikHelpers';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import { getValueFromIdValue } from 'src/utils/phases/getValueFromIdValue';
import {
  getPhaseByActivityType,
  inPersonActivityTypes,
} from 'src/utils/phases/taskActivityTypes';
import useTaskModal from '../../../../../hooks/useTaskModal';
import { DateTimeFieldPair } from '../../../../common/DateTimePickers/DateTimeFieldPair';
import { useCreateTaskCommentMutation } from '../../Comments/Form/CreateTaskComment.generated';
import { TaskModalEnum } from '../../TaskModal';
import { GetTaskForTaskModalQuery } from '../../TaskModalTask.generated';
import { FormFieldsGridContainer } from '../Container/FormFieldsGridContainer';
import { ActivityTypeAutocomplete } from '../Inputs/ActivityTypeAutocomplete/ActivityTypeAutocomplete';
import { PhaseTags } from '../Inputs/PhaseTags/PhaseTags';
import { ResultAutocomplete } from '../Inputs/ResultAutocomplete/ResultAutocomplete';
import { SuggestedContactStatus } from '../Inputs/SuggestedContactStatus/SuggestedContactStatus';
import {
  TagTypeEnum,
  TagsAutocomplete,
} from '../Inputs/TagsAutocomplete/TagsAutocomplete';
import { possibleNextActions } from '../PossibleNextActions';
import { useUpdateContactStatusMutation } from '../TaskModal.generated';
import {
  extractSuggestedTags,
  getDatabaseValueFromResult,
} from '../TaskModalHelper';
import { possiblePartnerStatus } from '../possiblePartnerStatus';
import { possibleResults } from '../possibleResults';
import { useCompleteTaskMutation } from './CompleteTask.generated';

const StyledGrid = styled(Grid)(() => ({
  paddingTop: '0 !important',
}));

const taskSchema = yup.object({
  id: yup.string().required(),
  displayResult: yup.mixed<DisplayResultEnum>().nullable(),
  result: yup.mixed<ResultEnum>().required(),
  changeContactStatus: yup.boolean(),
  nextAction: yup.mixed<ActivityTypeEnum>().nullable(),
  tagList: yup.array().of(yup.string().required()).default([]),
  completedAt: nullableDateTime(),
  comment: yup.string().ensure(),
});
type Attributes = yup.InferType<typeof taskSchema>;

interface Props {
  accountListId: string;
  task: GetTaskForTaskModalQuery['task'];
  onClose: () => void;
  showFlowsMessage?: boolean;
}

const TaskModalCompleteForm = ({
  accountListId,
  task,
  onClose,
  showFlowsMessage = false,
}: Props): ReactElement => {
  const { t } = useTranslation();
  const { openTaskModal } = useTaskModal();
  const { enqueueSnackbar } = useSnackbar();
  const activityType = task.activityType || undefined;
  const taskPhase = useMemo(() => getPhaseByActivityType(activityType), [task]);
  const { phaseData, setPhaseId, activityTypes } = usePhaseData(taskPhase);

  const initialCompletedAt =
    task.completedAt ||
    (inPersonActivityTypes.includes(activityType as ActivityTypeEnum) ||
    taskPhase === PhaseEnum.Appointment
      ? task.startAt
      : null);
  const initialTask = useMemo(
    () => ({
      id: task.id,
      completedAt: initialCompletedAt
        ? DateTime.fromISO(initialCompletedAt)
        : DateTime.local(),
      displayResult: null,
      result: ResultEnum.Completed,
      changeContactStatus: false,
      nextAction: null,
      tagList: task.tagList,
      comment: '',
    }),
    [task],
  );

  const [resultSelected, setResultSelected] = useState<
    ResultEnum | DisplayResultEnum | null
  >(task?.result || null);

  const activityData = activityType
    ? activityTypes.get(activityType)
    : undefined;
  const [selectedSuggestedTags, setSelectedSuggestedTags] = useState<string[]>(
    [],
  );

  const [updateContactStatus] = useUpdateContactStatusMutation();
  const [updateTask, { loading: saving }] = useCompleteTaskMutation();
  const [createTaskComment] = useCreateTaskCommentMutation();
  const { update } = useUpdateTasksQueries();

  useEffect(() => {
    if (activityType && activityTypes) {
      const activityData = activityTypes.get(activityType);
      if (activityData) {
        setPhaseId(activityData.phaseId);
      }
    }
  }, [activityTypes]);

  const onSubmit = async (
    { completedAt, comment, changeContactStatus, ...attributes }: Attributes,
    suggestedPartnerStatus?: StatusEnum | null,
  ): Promise<void> => {
    const updatingContactStatus =
      changeContactStatus && !!suggestedPartnerStatus;

    if (attributes.displayResult) {
      attributes.result = getDatabaseValueFromResult(
        phaseData,
        attributes.displayResult,
        activityType,
      );
    }

    if (selectedSuggestedTags.length) {
      attributes.tagList.concat(selectedSuggestedTags);
    }

    const mutations = [
      updateTask({
        variables: {
          accountListId,
          attributes: { completedAt: completedAt?.toISO(), ...attributes },
        },
        refetchQueries: ['ContactTasksTab', 'GetWeeklyActivity', 'GetThisWeek'],
      }),
    ];
    const body = comment.trim();
    if (body) {
      mutations.push(
        createTaskComment({
          variables: {
            accountListId,
            taskId: task.id,
            attributes: { id: uuidv4(), body },
          },
        }),
      );
    }
    if (updatingContactStatus) {
      task.contacts.nodes.forEach((contact) => {
        mutations.push(
          updateContactStatus({
            variables: {
              accountListId,
              attributes: {
                id: contact.id,
                status: suggestedPartnerStatus,
              },
            },
            onError: () => {
              enqueueSnackbar(
                t("Error while updating {{name}}'s status", {
                  name: contact.name,
                }),
                {
                  variant: 'error',
                },
              );
            },
          }),
        );
      });
    }
    await Promise.all(mutations);
    update();

    dispatch('mpdx-task-completed');
    enqueueSnackbar(t('Task saved successfully'), { variant: 'success' });
    if (updatingContactStatus) {
      enqueueSnackbar(t('Updated contact(s) status successfully'), {
        variant: 'success',
      });
    }
    onClose();
    if (attributes.nextAction) {
      openTaskModal({
        view: TaskModalEnum.Add,
        defaultValues: {
          activityType: attributes.nextAction,
          // TODO: Use fragments to ensure all required fields are loaded
          contactIds: task.contacts.nodes.map((contact) => contact.id),
          userId: task.user?.id,
          tagList: extractSuggestedTags(task?.tagList, phaseTags)
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
    () => possiblePartnerStatus(phaseData, resultSelected, activityType),
    [phaseData, resultSelected, activityType],
  );

  const nextActions = useMemo(
    () => possibleNextActions(phaseData, resultSelected, activityType),
    [phaseData, resultSelected, activityType],
  );

  const phaseTags = useMemo(
    () =>
      phaseData?.results?.tags?.map((tag) => getValueFromIdValue(tag)) || [],
    [phaseData],
  );

  const contactIds = useMemo(
    () => task.contacts.nodes.map((contact) => contact.id) || [],
    [task],
  );

  const numberOfContacts = contactIds.length;

  return (
    <Formik<Attributes>
      initialValues={initialTask}
      validationSchema={taskSchema}
      onSubmit={(values) =>
        onSubmit(values, partnerStatus?.suggestedContactStatus)
      }
      enableReinitialize
    >
      {({
        values: {
          completedAt,
          tagList,
          displayResult,
          changeContactStatus,
          nextAction,
          comment,
        },
        setFieldValue,
        handleChange,
        handleSubmit,
        isSubmitting,
        isValid,
      }): ReactElement => (
        <form onSubmit={handleSubmit} noValidate>
          <DialogContent dividers style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {showFlowsMessage && (
              <Alert sx={{ marginBottom: 2 }}>
                {t(
                  "The contact's status has been updated. Now you can complete the contact's most recent task.",
                )}
              </Alert>
            )}
            <FormFieldsGridContainer>
              <Grid item>
                <Typography style={{ fontWeight: 600 }} display="inline">
                  {activityData ? activityData.phase + ' - ' : ''}
                  {getLocalizedTaskType(t, activityType)}
                </Typography>
              </Grid>
              <StyledGrid item>
                <Typography style={{ fontWeight: 600 }} display="inline">
                  {t('Subject: ')}
                </Typography>
                <Typography display="inline">{task?.subject}</Typography>
              </StyledGrid>
              <StyledGrid item>
                <Typography style={{ fontWeight: 600 }} display="inline">
                  {numberOfContacts > 1
                    ? t('Contacts: ')
                    : numberOfContacts > 0
                    ? t('Contact: ')
                    : null}
                </Typography>
                {task?.contacts.nodes.map((contact, index) => (
                  <Typography
                    display={numberOfContacts === 1 ? 'inline' : 'block'}
                    key={contact.id}
                  >
                    {index !== numberOfContacts - 1
                      ? `${contact.name},`
                      : contact.name}
                  </Typography>
                ))}
              </StyledGrid>
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
                contactStatus={
                  numberOfContacts === 1 ? task.contacts.nodes[0]?.status : null
                }
              />

              {nextActions.length > 0 && (
                <Grid item>
                  <ActivityTypeAutocomplete
                    options={nextActions}
                    value={nextAction || undefined}
                    label={t('Next Action')}
                    onChange={(nextAction) =>
                      setFieldValue('nextAction', nextAction)
                    }
                    activityTypes={activityTypes}
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
              <Grid item>
                <TagsAutocomplete
                  accountListId={accountListId}
                  type={TagTypeEnum.Tag}
                  value={tagList ?? []}
                  onChange={(tagList) => setFieldValue('tagList', tagList)}
                  label={phaseTags?.length ? t('Additional Tags') : ''}
                />
              </Grid>

              <Grid item>
                <TextField
                  label={t('Add New Comment')}
                  value={comment}
                  onChange={handleChange('comment')}
                  fullWidth
                  multiline
                  inputProps={{ 'aria-label': t('Add New Comment') }}
                />
              </Grid>
            </FormFieldsGridContainer>
          </DialogContent>
          <DialogActions>
            <CancelButton disabled={isSubmitting} onClick={onClose} />
            <SubmitButton disabled={!isValid || isSubmitting}>
              {saving && (
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

export default TaskModalCompleteForm;
