import React, { ReactElement, useState } from 'react';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Schedule from '@mui/icons-material/Schedule';
import {
  Autocomplete,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
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
  ResultEnum,
  TaskUpdateInput,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';
import { dispatch } from 'src/lib/analytics';
import { getDateFormatPattern } from 'src/lib/intlFormat/intlFormat';
import { getLocalizedResultString } from 'src/utils/functions/getLocalizedResultStrings';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import useTaskModal from '../../../../../hooks/useTaskModal';
import theme from '../../../../../theme';
import { useCreateTaskCommentMutation } from '../../Comments/Form/CreateTaskComment.generated';
import { GetTaskForTaskModalQuery } from '../../TaskModalTask.generated';
import { FormFieldsGridContainer } from '../Container/FormFieldsGridContainer';
import { possibleNextActions } from '../PossibleNextActions';
import { possibleResults } from '../PossibleResults';
import { useGetDataForTaskModalQuery } from '../TaskModal.generated';
import { useCompleteTaskMutation } from './CompleteTask.generated';

const taskSchema: yup.SchemaOf<
  Pick<
    TaskUpdateInput,
    'id' | 'result' | 'nextAction' | 'tagList' | 'completedAt'
  >
> = yup.object({
  id: yup.string().required(),
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
    result: ResultEnum.Completed,
    tagList: task.tagList,
  };
  const { t } = useTranslation();
  const locale = useLocale();
  const [commentBody, changeCommentBody] = useState('');
  const { openTaskModal } = useTaskModal();
  const { enqueueSnackbar } = useSnackbar();

  const { data } = useGetDataForTaskModalQuery({
    variables: { accountListId },
  });
  const [updateTask, { loading: saving }] = useCompleteTaskMutation();
  const [createTaskComment] = useCreateTaskCommentMutation();
  const { update } = useUpdateTasksQueries();
  const onSubmit = async (attributes: TaskUpdateInput): Promise<void> => {
    const body = commentBody.trim();
    const mutations = [
      updateTask({
        variables: { accountListId, attributes },
        refetchQueries: ['ContactTasksTab', 'GetWeeklyActivity', 'GetThisWeek'],
      }),
    ];
    if (body !== '') {
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
    if (
      attributes.nextAction &&
      attributes.nextAction !== ActivityTypeEnum.None
    ) {
      openTaskModal({
        view: 'add',
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
                        inputFormat={getDateFormatPattern(locale)}
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
                    <Autocomplete
                      openOnFocus
                      autoHighlight
                      value={
                        nextAction === null || typeof nextAction === 'undefined'
                          ? ''
                          : nextAction
                      }
                      // Sort none to top
                      options={availableNextActions.sort((a) =>
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
                        <TextField {...params} label={t('Next Action')} />
                      )}
                      onChange={(_, activity): void => {
                        setFieldValue(
                          'nextAction',
                          activity === ActivityTypeEnum.None ? null : activity,
                        );
                      }}
                    />
                  </FormControl>
                </Grid>
              )}
              {/*Add field to change contact statuses */}
              <Grid item>
                <Autocomplete
                  multiple
                  autoHighlight
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
