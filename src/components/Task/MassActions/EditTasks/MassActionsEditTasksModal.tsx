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
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Schedule from '@mui/icons-material/Schedule';
import { MobileDatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import { Formik } from 'formik';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { v4 as uuidv4 } from 'uuid';
import {
  ActivityTypeEnum,
  TaskUpdateInput,
} from '../../../../../graphql/types.generated';
import Modal from '../../../common/Modal/Modal';
import { useCreateTaskCommentMutation } from 'src/components/Task/Modal/Comments/Form/CreateTaskComment.generated';
import theme from 'src/theme';
import { useGetDataForTaskModalQuery } from 'src/components/Task/Modal/Form/TaskModal.generated';
import { useMassActionsUpdateTasksMutation } from 'src/components/Task/MassActions/MassActionsUpdateTasks.generated';
import { TasksDocument } from 'pages/accountLists/[accountListId]/tasks/Tasks.generated';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { IncompleteWarning } from '../IncompleteWarning/IncompleteWarning';
import { getDateFormatPattern } from 'src/lib/intlFormat/intlFormat';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';

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

  const [updateTasks] = useMassActionsUpdateTasksMutation();
  const [createTaskComment] = useCreateTaskCommentMutation();

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
    await updateTasks({
      variables: {
        accountListId,
        attributes,
      },
      update: () => {
        if (body) {
          for (const taskId of ids) {
            const id = uuidv4();
            createTaskComment({
              variables: { accountListId, taskId, attributes: { id, body } },
            });
          }
        }
      },
      refetchQueries: [
        {
          query: TasksDocument,
          variables: { accountListId },
        },
      ],
    });
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
          subject: null,
          activityType: null,
          userId: null,
          startAt: null,
          noDueDate: false,
          body: null,
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
          <form onSubmit={handleSubmit} noValidate>
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
                      inputProps={{ 'aria-label': 'Task Name' }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <FormControl fullWidth>
                    <InputLabel id="activityType">{t('Action')}</InputLabel>
                    <Select
                      label={t('Action')}
                      labelId="activityType"
                      value={activityType}
                      onChange={(e) =>
                        setFieldValue('activityType', e.target.value)
                      }
                    >
                      <MenuItem value={''}>
                        <em>{t("Don't change")}</em>
                      </MenuItem>
                      <MenuItem value={ActivityTypeEnum.None}>
                        {t('None')}
                      </MenuItem>
                      {Object.values(ActivityTypeEnum)
                        .filter((val) => val !== ActivityTypeEnum.None)
                        .map((val) => (
                          <MenuItem key={val} value={val}>
                            {getLocalizedTaskType(t, val)}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <FormControl fullWidth>
                    {!loading ? (
                      <Autocomplete
                        loading={loading}
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
                      inputFormat={getDateFormatPattern()}
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
                      inputProps={{ 'aria-label': 'Add New Comment' }}
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
