import React, { ReactElement } from 'react';
import {
  Checkbox,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Grid,
  TextField,
} from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import * as yup from 'yup';
import { useMassActionsUpdateTasksMutation } from 'src/components/Task/MassActions/MassActionsUpdateTasks.generated';
import { useCreateTaskCommentMutation } from 'src/components/Task/Modal/Comments/Form/CreateTaskComment.generated';
import { DateTimeFieldPair } from 'src/components/common/DateTimePickers/DateTimeFieldPair';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import {
  ActivityTypeEnum,
  PhaseEnum,
  TaskUpdateInput,
} from 'src/graphql/types.generated';
import { usePhaseData } from 'src/hooks/usePhaseData';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';
import { nullableDateTime } from 'src/lib/formikHelpers';
import Modal from '../../../common/Modal/Modal';
import { ActivityTypeAutocomplete } from '../../Modal/Form/Inputs/ActivityTypeAutocomplete/ActivityTypeAutocomplete';
import { AssigneeAutocomplete } from '../../Modal/Form/Inputs/ActivityTypeAutocomplete/AssigneeAutocomplete/AssigneeAutocomplete';
import { TaskPhaseAutocomplete } from '../../Modal/Form/Inputs/TaskPhaseAutocomplete/TaskPhaseAutocomplete';
import { IncompleteWarning } from '../IncompleteWarning/IncompleteWarning';

const massActionsEditTasksSchema = yup.object({
  subject: yup.string().nullable(),
  taskPhase: yup.mixed<PhaseEnum>().nullable(),
  activityType: yup.mixed<ActivityTypeEnum>().nullable(),
  userId: yup.string().nullable(),
  startAt: nullableDateTime(),
  noDueDate: yup.boolean().required(),
  body: yup.string().nullable(),
});

type Attributes = yup.InferType<typeof massActionsEditTasksSchema>;

interface MassActionsEditTasksModalProps {
  ids: string[];
  selectedIdCount: number;
  accountListId: string;
  handleClose: () => void;
}

export const MassActionsEditTasksModal: React.FC<
  MassActionsEditTasksModalProps
> = ({ handleClose, accountListId, ids, selectedIdCount }) => {
  const { t } = useTranslation();

  const [updateTasks] = useMassActionsUpdateTasksMutation();
  const [createTaskComment] = useCreateTaskCommentMutation();
  const { update } = useUpdateTasksQueries();
  const { taskPhases, activitiesByPhase } = usePhaseData();

  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (fields: Attributes) => {
    const { noDueDate, body } = fields;
    const formattedFields: Partial<TaskUpdateInput> = {};
    ['subject', 'activityType', 'userId'].forEach((key) => {
      const value = fields[key];
      if (value) {
        formattedFields[key] = value;
      }
    });
    if (formattedFields.activityType === ActivityTypeEnum.None) {
      formattedFields.activityType = null;
    }
    if (noDueDate) {
      formattedFields.startAt = null;
    } else if (fields.startAt) {
      formattedFields.startAt = fields.startAt.toISO();
    }
    const attributes = ids.map((id) => ({
      id,
      ...formattedFields,
    }));
    const updateMutation = updateTasks({
      variables: {
        accountListId,
        attributes,
      },
      refetchQueries: ['ContactTasksTab', 'GetWeeklyActivity', 'GetThisWeek'],
    });
    const commentMutations = body
      ? ids.map((taskId) =>
          createTaskComment({
            variables: {
              accountListId,
              taskId,
              attributes: { id: uuidv4(), body },
            },
          }),
        )
      : [];
    await Promise.all([updateMutation, ...commentMutations]);
    update();
    enqueueSnackbar(t('Tasks updated!'), {
      variant: 'success',
    });
    handleClose();
  };

  return (
    <Modal title={t('Edit Fields')} isOpen={true} handleClose={handleClose}>
      <Formik<Attributes>
        initialValues={{
          subject: '',
          taskPhase: null,
          activityType: undefined,
          userId: null,
          startAt: null,
          noDueDate: false,
          body: '',
        }}
        onSubmit={onSubmit}
        validationSchema={massActionsEditTasksSchema}
      >
        {({
          values: {
            subject,
            activityType,
            taskPhase,
            userId,
            startAt,
            noDueDate,
            body,
          },
          handleChange,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form onSubmit={handleSubmit} noValidate data-testid="EditTasksModal">
            <DialogContent dividers>
              <IncompleteWarning
                selectedIdCount={selectedIdCount}
                idCount={ids.length}
              />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label={t('Task Name')}
                    value={subject}
                    onChange={handleChange('subject')}
                    fullWidth
                    multiline
                    inputProps={{ 'aria-label': t('Task Name') }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TaskPhaseAutocomplete
                    options={taskPhases}
                    value={taskPhase}
                    onChange={(phase) => {
                      setFieldValue('taskPhase', phase);
                      setFieldValue('activityType', '');
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ActivityTypeAutocomplete
                    options={
                      (taskPhase && activitiesByPhase.get(taskPhase)) || []
                    }
                    label={t('Action')}
                    value={activityType || undefined}
                    onChange={(activityType) =>
                      setFieldValue('activityType', activityType)
                    }
                    // None and null are distinct values: null leaves the action unchanged and None changes the action to None
                    preserveNone
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <AssigneeAutocomplete
                    accountListId={accountListId}
                    value={userId}
                    onChange={(userId) => setFieldValue('userId', userId)}
                  />
                </Grid>
                {!noDueDate && (
                  <DateTimeFieldPair
                    dateLabel={t('Due Date')}
                    timeLabel={t('Due Time')}
                    value={startAt}
                    onChange={(date) => setFieldValue('startAt', date)}
                    render={(dateField, timeField) => (
                      <>
                        <Grid item xs={12} sm={6}>
                          {dateField}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          {timeField}
                        </Grid>
                      </>
                    )}
                  />
                )}
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={<Checkbox checked={noDueDate} color="secondary" />}
                    label={t('No Due Date')}
                    name="noDueDate"
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('Add New Comment')}
                    value={body}
                    onChange={handleChange('body')}
                    fullWidth
                    multiline
                    inputProps={{ 'aria-label': t('Add New Comment') }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton disabled={!isValid || isSubmitting}>
                {/* {updating && <LoadingIndicator color="primary" size={20} />} */}
                {t('Save')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
