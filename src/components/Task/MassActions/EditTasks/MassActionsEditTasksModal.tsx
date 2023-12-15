import React, { ReactElement } from 'react';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Schedule from '@mui/icons-material/Schedule';
import {
  Autocomplete,
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  TextField,
} from '@mui/material';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import * as yup from 'yup';
import { useMassActionsUpdateTasksMutation } from 'src/components/Task/MassActions/MassActionsUpdateTasks.generated';
import { useCreateTaskCommentMutation } from 'src/components/Task/Modal/Comments/Form/CreateTaskComment.generated';
import { useGetDataForTaskModalQuery } from 'src/components/Task/Modal/Form/TaskModal.generated';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { useLocale } from 'src/hooks/useLocale';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';
import { getDateFormatPattern } from 'src/lib/intlFormat/intlFormat';
import theme from 'src/theme';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import {
  ActivityTypeEnum,
  TaskUpdateInput,
} from '../../../../../graphql/types.generated';
import Modal from '../../../common/Modal/Modal';
import { IncompleteWarning } from '../IncompleteWarning/IncompleteWarning';

interface MassActionsEditTasksModalProps {
  ids: string[];
  selectedIdCount: number;
  accountListId: string;
  handleClose: () => void;
}

type EditTasksFields = {
  subject: string | null;
  activityType: ActivityTypeEnum | null;
  userId: string | null;
  startAt: string | null;
  noDueDate: boolean;
  body: string | null;
};

const MassActionsEditTasksSchema = yup.object({
  subject: yup.string().nullable(),
  activityType: yup.mixed<ActivityTypeEnum>(),
  userId: yup.string().nullable(),
  startAt: yup.string().nullable(),
  noDueDate: yup.boolean().required(),
  body: yup.string().nullable(),
});

export const MassActionsEditTasksModal: React.FC<
  MassActionsEditTasksModalProps
> = ({ handleClose, accountListId, ids, selectedIdCount }) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const [updateTasks] = useMassActionsUpdateTasksMutation();
  const [createTaskComment] = useCreateTaskCommentMutation();
  const { update } = useUpdateTasksQueries();

  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (fields: EditTasksFields) => {
    const { noDueDate, body } = fields;
    const formattedFields: Partial<TaskUpdateInput> = {};
    ['subject', 'activityType', 'startAt', 'userId'].forEach((key) => {
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

  const { data, loading } = useGetDataForTaskModalQuery({
    variables: {
      accountListId,
    },
  });

  return (
    <Modal title={t('Edit Fields')} isOpen={true} handleClose={handleClose}>
      <Formik
        initialValues={{
          subject: '',
          activityType: null,
          userId: null,
          startAt: null,
          noDueDate: false,
          body: '',
        }}
        onSubmit={onSubmit}
        validationSchema={MassActionsEditTasksSchema}
      >
        {({
          values: { subject, activityType, userId, startAt, noDueDate, body },
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
                  <FormControl fullWidth>
                    <TextField
                      label={t('Task Name')}
                      value={subject}
                      onChange={handleChange('subject')}
                      fullWidth
                      multiline
                      inputProps={{ 'aria-label': t('Task Name') }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <FormControl fullWidth>
                    <Autocomplete
                      openOnFocus
                      autoSelect
                      autoHighlight
                      value={
                        activityType === null ||
                        typeof activityType === 'undefined'
                          ? ''
                          : activityType
                      }
                      // Sort None to top
                      options={[
                        'DONT_CHANGE',
                        ...Object.values(ActivityTypeEnum).sort((a) =>
                          a === ActivityTypeEnum.None ? -1 : 1,
                        ),
                      ]}
                      getOptionLabel={(activity) =>
                        activity === ActivityTypeEnum.None
                          ? t('None')
                          : activity === 'DONT_CHANGE'
                          ? t("Don't change")
                          : getLocalizedTaskType(
                              t,
                              activity as ActivityTypeEnum,
                            )
                      }
                      renderInput={(params): ReactElement => (
                        <TextField {...params} label={t('Action')} />
                      )}
                      onChange={(_, activity): void => {
                        setFieldValue(
                          'activityType',
                          activity === 'DONT_CHANGE' ? '' : activity,
                        );
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <FormControl fullWidth>
                    {!loading ? (
                      <Autocomplete
                        loading={loading}
                        autoSelect
                        autoHighlight
                        options={
                          (data?.accountListUsers?.nodes &&
                            data.accountListUsers.nodes.map(
                              ({ user }) => user.id,
                            )) ||
                          []
                        }
                        getOptionLabel={(userId): string => {
                          const user = data?.accountListUsers?.nodes.find(
                            ({ user }) => user.id === userId,
                          )?.user;
                          return `${user?.firstName} ${user?.lastName}`;
                        }}
                        renderInput={(params): ReactElement => (
                          <TextField
                            {...params}
                            label={t('Assignee')}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loading && (
                                    <CircularProgress
                                      color="primary"
                                      size={20}
                                    />
                                  )}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        value={userId}
                        onChange={(_, userId): void =>
                          setFieldValue('userId', userId)
                        }
                        isOptionEqualToValue={(option, value): boolean =>
                          option === value
                        }
                      />
                    ) : (
                      <CircularProgress color="primary" size={20} />
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <FormControl fullWidth>
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
                      label={t('Due Date')}
                      value={startAt}
                      onChange={(date): void => setFieldValue('startAt', date)}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <FormControl fullWidth>
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
                      label={t('Due Time')}
                      value={startAt}
                      onChange={(date): void => setFieldValue('startAt', date)}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <FormControl fullWidth>
                    <FormControlLabel
                      control={
                        <Checkbox checked={noDueDate} color="secondary" />
                      }
                      label={t('No Due Date')}
                      name="noDueDate"
                      onChange={handleChange}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField
                      label={t('Add New Comment')}
                      value={body}
                      onChange={handleChange('body')}
                      fullWidth
                      multiline
                      inputProps={{ 'aria-label': t('Add New Comment') }}
                    />
                  </FormControl>
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
