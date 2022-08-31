import React, { ReactElement } from 'react';
import {
  makeStyles,
  Theme,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Grid,
  Box,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Autocomplete } from '@material-ui/lab';
import { DatePicker, TimePicker } from '@material-ui/pickers';
import { Formik } from 'formik';
import * as yup from 'yup';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { dateFormat } from '../../../../lib/intlFormat/intlFormat';
import {
  ActivityTypeEnum,
  ContactConnection,
  ResultEnum,
  TaskUpdateInput,
  UserScopedToAccountList,
} from '../../../../../graphql/types.generated';
import { GetTaskForTaskDrawerQuery } from '../TaskDrawerTask.generated';
import { useGetDataForTaskDrawerQuery } from '../Form/TaskDrawer.generated';
import { GetThisWeekDocument } from '../../../Dashboard/ThisWeek/GetThisWeek.generated';
import useTaskDrawer from '../../../../hooks/useTaskDrawer';
import { useCompleteTaskMutation } from './CompleteTask.generated';

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    width: '100%',
  },
  select: {
    fontSize: theme.typography.h6.fontSize,
    minHeight: 'auto',
    '&:focus': {
      backgroundColor: 'transparent',
    },
  },
  container: {
    padding: theme.spacing(2, 2),
  },
  title: {
    flexGrow: 1,
  },
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

const TaskDrawerCompleteForm = ({
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

  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { openTaskDrawer } = useTaskDrawer();
  const { data } = useGetDataForTaskDrawerQuery({
    variables: { accountListId },
  });
  const [updateTask, { loading: saving }] = useCompleteTaskMutation();
  const onSubmit = async (attributes: TaskUpdateInput): Promise<void> => {
    const endOfDay = DateTime.local().endOf('day');
    await updateTask({
      variables: { accountListId, attributes },
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
      openTaskDrawer({
        defaultValues: {
          activityType: attributes.nextAction,
          // TODO: Use fragments to ensure all required fields are loaded
          contacts: task.contacts as ContactConnection,
          user: task.user as UserScopedToAccountList,
        },
      });
    }
  };

  const availableResults = ((): ResultEnum[] => {
    const common = [ResultEnum.None, ResultEnum.Completed];
    switch (task.activityType) {
      case ActivityTypeEnum.Call:
        return [
          ...common,
          ResultEnum.Attempted,
          ResultEnum.AttemptedLeftMessage,
          ResultEnum.Received,
        ];
      case ActivityTypeEnum.Appointment:
        return [...common, ResultEnum.Attempted];
      case ActivityTypeEnum.Email:
      case ActivityTypeEnum.TextMessage:
      case ActivityTypeEnum.FacebookMessage:
      case ActivityTypeEnum.TalkToInPerson:
      case ActivityTypeEnum.Letter:
      case ActivityTypeEnum.PreCallLetter:
      case ActivityTypeEnum.ReminderLetter:
      case ActivityTypeEnum.SupportLetter:
      case ActivityTypeEnum.Thank:
        return [...common, ResultEnum.Received];
      case ActivityTypeEnum.PrayerRequest:
        return common;
      default:
        return [];
    }
  })();

  const availableNextActions = ((): ActivityTypeEnum[] => {
    const common = [
      ActivityTypeEnum.None,
      ActivityTypeEnum.Call,
      ActivityTypeEnum.Email,
      ActivityTypeEnum.TextMessage,
      ActivityTypeEnum.FacebookMessage,
      ActivityTypeEnum.TalkToInPerson,
    ];
    switch (task.activityType) {
      case ActivityTypeEnum.Call:
      case ActivityTypeEnum.Email:
      case ActivityTypeEnum.TextMessage:
      case ActivityTypeEnum.FacebookMessage:
      case ActivityTypeEnum.TalkToInPerson:
      case ActivityTypeEnum.PrayerRequest:
        return [
          ...common,
          ActivityTypeEnum.Appointment,
          ActivityTypeEnum.PrayerRequest,
          ActivityTypeEnum.Thank,
        ];
      case ActivityTypeEnum.Appointment:
        return [
          ...common,
          ActivityTypeEnum.PrayerRequest,
          ActivityTypeEnum.Thank,
        ];
      case ActivityTypeEnum.Letter:
      case ActivityTypeEnum.PreCallLetter:
      case ActivityTypeEnum.ReminderLetter:
      case ActivityTypeEnum.SupportLetter:
      case ActivityTypeEnum.Thank:
        return common;
      default:
        return [];
    }
  })();

  return (
    <Formik
      initialValues={initialTask}
      validationSchema={taskSchema}
      onSubmit={onSubmit}
    >
      {({
        values: { result, nextAction, completedAt, tagList },
        setFieldValue,
        handleChange,
        handleSubmit,
        isSubmitting,
        isValid,
      }): ReactElement => (
        <form onSubmit={handleSubmit} noValidate>
          <Box m={2}>
            <Grid container direction="column" spacing={2}>
              {task.activityType && (
                <>
                  {availableResults.length > 0 && (
                    <Grid item>
                      <FormControl className={classes.formControl} required>
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
                      <FormControl className={classes.formControl}>
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
                </>
              )}
              <Grid item>
                <FormControl className={classes.formControl}>
                  <Grid container spacing={2}>
                    <Grid xs={6} item>
                      <DatePicker
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
                        fullWidth
                        autoOk
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
            </Grid>
          </Box>
          <Divider />
          <Box m={2}>
            <Grid container spacing={1} justifyContent="flex-end">
              <Grid item>
                <Button size="large" disabled={isSubmitting} onClick={onClose}>
                  {t('Cancel')}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
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
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default TaskDrawerCompleteForm;
