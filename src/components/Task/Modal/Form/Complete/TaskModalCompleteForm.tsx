import React, { ReactElement, useMemo, useState } from 'react';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
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
import { ActivityTypeEnum, ResultEnum } from 'src/graphql/types.generated';
import { useGetPhaseData } from 'src/hooks/useContactPhaseData';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';
import { PhaseTypeEnum } from 'src/lib/MPDPhases';
import { dispatch } from 'src/lib/analytics';
import { nullableDateTime } from 'src/lib/formikHelpers';
import { getLocalizedResultString } from 'src/utils/functions/getLocalizedResultStrings';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import useTaskModal from '../../../../../hooks/useTaskModal';
import { DateTimeFieldPair } from '../../../../common/DateTimePickers/DateTimeFieldPair';
import { useCreateTaskCommentMutation } from '../../Comments/Form/CreateTaskComment.generated';
import { GetTaskForTaskModalQuery } from '../../TaskModalTask.generated';
import { FormFieldsGridContainer } from '../Container/FormFieldsGridContainer';
import { ActivityTypeAutocomplete } from '../Inputs/ActivityTypeAutocomplete/ActivityTypeAutocomplete';
import { PhaseTags } from '../Inputs/PhaseTags/PhaseTags';
import {
  TagTypeEnum,
  TagsAutocomplete,
} from '../Inputs/TagsAutocomplete/TagsAutocomplete';
import { possibleNextActions } from '../PossibleNextActions';
import { possibleResults } from '../PossibleResults';
import { useCompleteTaskMutation } from './CompleteTask.generated';

const taskSchema = yup.object({
  id: yup.string().required(),
  result: yup.mixed<ResultEnum>().required(),
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
}

const TaskModalCompleteForm = ({
  accountListId,
  task,
  onClose,
}: Props): ReactElement => {
  const { activityType } = task;
  const initialCompletedAt =
    task.completedAt ||
    (activityType === ActivityTypeEnum.Appointment ? task.startAt : null);
  const initialTask = useMemo(
    () => ({
      id: task.id,
      completedAt: initialCompletedAt
        ? DateTime.fromISO(initialCompletedAt)
        : DateTime.local(),
      result: ResultEnum.Completed,
      nextAction:
        activityType && possibleNextActions(activityType).includes(activityType)
          ? activityType
          : null,
      tagList: task.tagList,
      comment: '',
    }),
    [task],
  );

  const { t } = useTranslation();
  const { openTaskModal } = useTaskModal();
  const { enqueueSnackbar } = useSnackbar();

  // TODO - Change this to Task Type when Caleb Alldrin has created it.
  // Remove PhaseTypeEnum.appointment
  // Replace with Task Type
  const [phaseData] = useGetPhaseData(PhaseTypeEnum.appointment);

  const [selectedSuggestedTags, setSelectedSuggestedTags] = useState<string[]>(
    [],
  );
  const [updateTask, { loading: saving }] = useCompleteTaskMutation();
  const [createTaskComment] = useCreateTaskCommentMutation();
  const { update } = useUpdateTasksQueries();
  const onSubmit = async ({
    completedAt,
    comment,
    ...attributes
  }: Attributes): Promise<void> => {
    if (selectedSuggestedTags.length) {
      attributes.tagList = attributes.tagList.concat(selectedSuggestedTags);
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
    await Promise.all(mutations);
    update();

    dispatch('mpdx-task-completed');
    enqueueSnackbar(t('Task saved successfully'), { variant: 'success' });
    onClose();
    if (attributes.nextAction) {
      openTaskModal({
        view: 'add',
        defaultValues: {
          subject: task.subject,
          activityType: attributes.nextAction,
          // TODO: Use fragments to ensure all required fields are loaded
          contactIds: task.contacts.nodes.map((contact) => contact.id),
          userId: task.user?.id,
          tagList: task.tagList,
        },
      });
    }
  };

  const availableResults = phaseData ? possibleResults(phaseData) : [];
  const availableNextActions = task.activityType
    ? possibleNextActions(task.activityType)
    : [];

  return (
    <Formik<Attributes>
      initialValues={initialTask}
      validationSchema={taskSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({
        values: { completedAt, tagList, result, nextAction, comment },
        setFieldValue,
        handleChange,
        handleSubmit,
        isSubmitting,
        isValid,
      }): ReactElement => (
        <form onSubmit={handleSubmit} noValidate>
          <DialogContent dividers style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <FormFieldsGridContainer>
              <Grid item>
                <Typography style={{ fontWeight: 600 }} display="inline">
                  {getLocalizedTaskType(t, task?.activityType)}
                </Typography>{' '}
                <Typography display="inline">{task?.subject}</Typography>{' '}
                {task?.contacts.nodes.map((contact, index) => (
                  <Typography key={contact.id}>
                    {index !== task.contacts.nodes.length - 1
                      ? `${contact.name},`
                      : contact.name}
                  </Typography>
                ))}
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
              {availableResults.length > 0 && (
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
              {availableNextActions.length > 0 && (
                <Grid item>
                  <ActivityTypeAutocomplete
                    options={availableNextActions}
                    value={nextAction}
                    label={t('Next Action')}
                    onChange={(nextAction) =>
                      setFieldValue('nextAction', nextAction)
                    }
                  />
                </Grid>
              )}
              {phaseData?.resultOptions.tags && (
                <PhaseTags
                  tags={phaseData.resultOptions.tags}
                  selectedTags={selectedSuggestedTags}
                  setSelectedTags={setSelectedSuggestedTags}
                />
              )}
              {/*Add field to change contact statuses */}
              <Grid item>
                <TagsAutocomplete
                  accountListId={accountListId}
                  type={TagTypeEnum.Tag}
                  value={tagList ?? []}
                  onChange={(tagList) => setFieldValue('tagList', tagList)}
                  label={
                    phaseData?.resultOptions.tags ? t('Additional Tags') : ''
                  }
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
