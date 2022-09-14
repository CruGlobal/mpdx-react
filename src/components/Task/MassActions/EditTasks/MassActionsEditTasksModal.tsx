import {
  Autocomplete,
  Button,
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
import { ActivityTypeEnum } from '../../../../../graphql/types.generated';
import Modal from '../../../common/Modal/Modal';
import { useCreateTaskCommentMutation } from 'src/components/Task/Drawer/CommentList/Form/CreateTaskComment.generated';
import theme from 'src/theme';
import { dateFormat } from 'src/lib/intlFormat/intlFormat';
import { useGetDataForTaskDrawerQuery } from 'src/components/Task/Drawer/Form/TaskDrawer.generated';
import { useMassActionsUpdateTasksMutation } from 'src/components/Task/MassActions/MassActionsUpdateTasks.generated';
import { TasksDocument } from 'pages/accountLists/[accountListId]/tasks/Tasks.generated';

interface MassActionsEditTasksModalProps {
  ids: string[];
  accountListId: string;
  handleClose: () => void;
}

type EditTasksFields = {
  subject: string | null;
  activityType: ActivityTypeEnum | null;
  userId: string | null;
  startAt: string | null;
  noDueDate: boolean | null | undefined;
  body: string | null;
};

const MassActionsEditTasksSchema = yup.object({
  subject: yup.string().nullable(),
  activityType: yup.mixed<ActivityTypeEnum>(),
  userId: yup.string().nullable(),
  startAt: yup.string().nullable(),
  noDueDate: yup.boolean().nullable(),
  body: yup.string().nullable(),
});

export const MassActionsEditTasksModal: React.FC<
  MassActionsEditTasksModalProps
> = ({ handleClose, accountListId, ids }) => {
  const { t } = useTranslation();

  const [updateTasks] = useMassActionsUpdateTasksMutation();
  const [createTaskComment] = useCreateTaskCommentMutation();

  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (fields: EditTasksFields) => {
    const { subject, activityType, startAt, userId, noDueDate, body } = fields;
    const relevantFields = {
      subject,
      activityType,
      startAt,
      userId,
    };
    const formattedFields: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(relevantFields)) {
      if (value) {
        formattedFields[key] = value;
      }
    }
    if (noDueDate) {
      formattedFields['startAt'] = null;
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

  const { data, loading } = useGetDataForTaskDrawerQuery({
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
          noDueDate: undefined,
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
                      labelId="activityType"
                      value={activityType}
                      onChange={(e) =>
                        setFieldValue('activityType', e.target.value)
                      }
                    >
                      <MenuItem value={undefined}>{t('None')}</MenuItem>
                      {Object.values(ActivityTypeEnum).map((val) => (
                        <MenuItem key={val} value={val}>
                          {t(val) /* manually added to translation file */}
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
                      renderInput={(params) => <TextField {...params} />}
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
                      label={t('Due Date')}
                      value={startAt}
                      onChange={(date): void => setFieldValue('startAt', date)}
                      okLabel={t('OK')}
                      todayLabel={t('Today')}
                      cancelLabel={t('Cancel')}
                      clearLabel={t('Clear')}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <FormControl fullWidth>
                    <MobileTimePicker
                      renderInput={(params) => <TextField {...params} />}
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
                      label={t('Due Time')}
                      value={startAt}
                      onChange={(date): void => setFieldValue('startAt', date)}
                      okLabel={t('OK')}
                      todayLabel={t('Today')}
                      cancelLabel={t('Cancel')}
                      clearLabel={t('Clear')}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <FormControl fullWidth>
                    <FormControlLabel
                      control={<Checkbox checked={noDueDate} />}
                      label="No Due Date"
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
              <Button
                onClick={handleClose}
                disabled={isSubmitting}
                variant="text"
              >
                {t('Cancel')}
              </Button>
              <Button
                color="primary"
                type="submit"
                variant="contained"
                disabled={!isValid || isSubmitting}
              >
                {/* {updating && <LoadingIndicator color="primary" size={20} />} */}
                {t('Save')}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
