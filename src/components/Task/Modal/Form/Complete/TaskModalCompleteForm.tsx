import React, { ReactElement, useState } from 'react';
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
  InputAdornment,
  Typography,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { DateTime } from 'luxon';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Schedule from '@mui/icons-material/Schedule';
import { v4 as uuidv4 } from 'uuid';
import {
  ActivityTypeEnum,
  ResultEnum,
  TaskUpdateInput,
} from '../../../../../../graphql/types.generated';
import { GetTaskForTaskModalQuery } from '../../../Modal/TaskModalTask.generated';
import { GetThisWeekDocument } from '../../../../Dashboard/ThisWeek/GetThisWeek.generated';
import { useGetDataForTaskModalQuery } from '../../../Modal/Form/TaskModal.generated';
import theme from '../../../../../../src/theme';
import { useCreateTaskCommentMutation } from '../../../Modal/Comments/Form/CreateTaskComment.generated';
import { possibleNextActions } from '../PossibleNextActions';
import { possibleResults } from '../PossibleResults';
import { useCompleteTaskMutation } from './CompleteTask.generated';
import useTaskModal from '../../../../../../src/hooks/useTaskModal';
import { FormFieldsGridContainer } from '../Container/FormFieldsGridContainer';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import { getLocalizedResultString } from 'src/utils/functions/getLocalizedResultStrings';

const taskSchema: yup.SchemaOf<
  Pick<
    TaskUpdateInput,
    'id' | 'result' | 'nextAction' | 'tagList' | 'completedAt'
  >
> = yup.object({
  id: yup.string(),
  result: yup.mixed<ResultEnum>().required(),
  nextAction: yup.mixed<ActivityTypeEnum>(),
  tagList: yup.array().of(yup.string()).default([]),
  completedAt: yup.string(),
});

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
  const initialTask: TaskUpdateInput = {
    id: task.id,
    completedAt: task.completedAt || DateTime.local().toISO(),
    result: ResultEnum.None,
    tagList: task.tagList,
  };
  const { t } = useTranslation();
  const [commentBody, changeCommentBody] = useState('');
  const { openTaskModal } = useTaskModal();
  const { enqueueSnackbar } = useSnackbar();

  const { data } = useGetDataForTaskModalQuery({
    variables: { accountListId },
  });
  const [updateTask, { loading: saving }] = useCompleteTaskMutation();
  const [createTaskComment] = useCreateTaskCommentMutation();
  const onSubmit = async (attributes: TaskUpdateInput): Promise<void> => {
    const body = commentBody.trim();
    const endOfDay = DateTime.local().endOf('day');
    await updateTask({
      variables: { accountListId, attributes },
      update: (_cache, { data }) => {
        if (data?.updateTask?.task.id && body !== '') {
          const id = uuidv4();

          createTaskComment({
            variables: {
              accountListId,
              taskId: data.updateTask.task.id,
              attributes: { id, body },
            },
          });
        }
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

    enqueueSnackbar(t('Task saved successfully'), { variant: 'success' });
    onClose();
    if (
      attributes.nextAction &&
      attributes.nextAction !== ActivityTypeEnum.None
    ) {
      openTaskModal({
        defaultValues: {
          activityType: attributes.nextAction,
          // TODO: Use fragments to ensure all required fields are loaded
          contactIds: task.contacts.nodes.map((contact) => contact.id),
          userId: task.user?.id,
          tagList: task.tagList,
        },
      });
    }
  };

  const availableResults = task.activityType
    ? possibleResults(task.activityType)
    : [];
  const availableNextActions = task.activityType
    ? possibleNextActions(task.activityType)
    : [];

  return (
    <Formik
      initialValues={initialTask}
      validationSchema={taskSchema}
      onSubmit={onSubmit}
    >
      {({
        values: { completedAt, tagList, result, nextAction },
        setFieldValue,
        handleSubmit,
        isSubmitting,
        isValid,
      }): ReactElement => (
        <form onSubmit={handleSubmit} noValidate>
          <DialogContent dividers>
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
                      <MenuItem value={undefined}>{t('None')}</MenuItem>
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
              {/*Add field to change contact statuses */}
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

              <Grid item>
                <TextField
                  label={t('Add New Comment')}
                  value={commentBody}
                  onChange={(event) => changeCommentBody(event.target.value)}
                  fullWidth
                  multiline
                  inputProps={{ 'aria-label': 'Add New Comment' }}
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
