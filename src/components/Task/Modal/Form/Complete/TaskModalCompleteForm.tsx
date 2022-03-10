import React, { ReactElement, useState } from 'react';
import {
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
  InputAdornment,
  Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Autocomplete } from '@material-ui/lab';

import { DatePicker, TimePicker } from '@material-ui/pickers';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { DateTime } from 'luxon';
import { CalendarToday, Schedule } from '@material-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import { dateFormat } from '../../../../../lib/intlFormat/intlFormat';
import {
  ActivityTypeEnum,
  ResultEnum,
  TaskUpdateInput,
} from '../../../../../../graphql/types.generated';
import { GetTaskForTaskDrawerQuery } from '../../../Drawer/TaskDrawerTask.generated';
import { GetThisWeekDocument } from '../../../../Dashboard/ThisWeek/GetThisWeek.generated';
import { useGetDataForTaskDrawerQuery } from '../../../Drawer/Form/TaskDrawer.generated';
import theme from '../../../../../../src/theme';
import { useCreateTaskCommentMutation } from '../../../Drawer/CommentList/Form/CreateTaskComment.generated';
import { possibleNextActions } from '../PossibleNextActions';
import { possibleResults } from '../PossibleResults';
import { useCompleteTaskMutation } from '../../../../../../src/components/Task/Drawer/CompleteForm/CompleteTask.generated';
import useTaskModal from '../../../../../../src/hooks/useTaskModal';

const ActionButton = styled(Button)(() => ({
  color: theme.palette.info.main,
  fontWeight: 550,
}));

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
  task: GetTaskForTaskDrawerQuery['task'];
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

  const { data } = useGetDataForTaskDrawerQuery({
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
            twoWeeksFromNow: endOfDay.plus({ weeks: 2 }).toISODate(),
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

  const availableResults = possibleResults(task);
  const availableNextActions = possibleNextActions(task);

  return (
    <Box>
      <Formik
        initialValues={initialTask}
        validationSchema={taskSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { completedAt, tagList, result, nextAction },
          setFieldValue,
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
        }): ReactElement => (
          <form onSubmit={handleSubmit} noValidate>
            <Box
              p={2}
              pb={4}
              width="100%"
              margin="auto"
              maxHeight="80vh"
              display="flex"
              flexDirection="column"
              alignItems="center"
              style={{ overflowY: 'auto' }}
            >
              <Grid
                container
                direction="column"
                spacing={2}
                style={{ width: '75%' }}
              >
                <Grid item>
                  <Typography style={{ fontWeight: 600 }} display="inline">
                    {task?.activityType}
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
                        <DatePicker
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
                          autoOk
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
                        <TimePicker
                          clearable
                          fullWidth
                          autoOk
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
                          okLabel={t('OK')}
                          todayLabel={t('Today')}
                          cancelLabel={t('Cancel')}
                          clearLabel={t('Clear')}
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
                        labelId="result"
                        value={result}
                        onChange={handleChange('result')}
                      >
                        {availableResults.map((val) => (
                          <MenuItem key={val} value={val}>
                            {t(val) /* manually added to translation file */}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {availableNextActions.length > 0 && (
                  <Grid item>
                    <FormControl fullWidth>
                      <InputLabel id="nextAction">
                        {t('Next Action')}
                      </InputLabel>
                      <Select
                        labelId="nextAction"
                        value={nextAction}
                        onChange={handleChange('nextAction')}
                      >
                        {availableNextActions.map((val) => (
                          <MenuItem key={val} value={val}>
                            {t(val) /* manually added to translation file */}
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
              </Grid>
            </Box>
            <Divider />
            <Box
              display="flex"
              justifyContent="end"
              alignItems="center"
              width="100%"
              p={1}
            >
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
                  {saving && (
                    <>
                      <CircularProgress color="primary" size={20} />
                      &nbsp;
                    </>
                  )}
                  {t('Save')}
                </ActionButton>
              </Box>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default TaskModalCompleteForm;
