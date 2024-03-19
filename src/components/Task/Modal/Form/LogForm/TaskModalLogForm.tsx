import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { Formik } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import {
  ActivityTypeEnum,
  ResultEnum,
  TaskCreateInput,
} from 'src/graphql/types.generated';
import { useGetPhaseData } from 'src/hooks/useContactPhaseData';
import useTaskModal from 'src/hooks/useTaskModal';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';
import { useUser } from 'src/hooks/useUser';
import { PhaseTypeEnum } from 'src/lib/MPDPhases';
import { dispatch } from 'src/lib/analytics';
import { nullableDateTime } from 'src/lib/formikHelpers';
import { getLocalizedResultString } from 'src/utils/functions/getLocalizedResultStrings';
import { DateTimeFieldPair } from '../../../../common/DateTimePickers/DateTimeFieldPair';
import { FormFieldsGridContainer } from '../Container/FormFieldsGridContainer';
import { ActivityTypeAutocomplete } from '../Inputs/ActivityTypeAutocomplete/ActivityTypeAutocomplete';
import { AssigneeAutocomplete } from '../Inputs/ActivityTypeAutocomplete/AssigneeAutocomplete/AssigneeAutocomplete';
import { ContactsAutocomplete } from '../Inputs/ContactsAutocomplete/ContactsAutocomplete';
import { PhaseTags } from '../Inputs/PhaseTags/PhaseTags';
import {
  TagTypeEnum,
  TagsAutocomplete,
} from '../Inputs/TagsAutocomplete/TagsAutocomplete';
import { TaskTypeAutocomplete } from '../Inputs/TaskTypeAutocomplete/TaskTypeAutocomplete';
import { possibleNextActions } from '../PossibleNextActions';
import { possibleResults } from '../PossibleResults';
import { useCreateTasksMutation } from '../TaskModal.generated';

const taskSchema = yup.object({
  taskType: yup.mixed<PhaseTypeEnum>().nullable(),
  activityType: yup.mixed<ActivityTypeEnum>().nullable(),
  subject: yup.string().required(),
  contactIds: yup.array().of(yup.string()).default([]),
  completedAt: nullableDateTime(),
  userId: yup.string().nullable(),
  tagList: yup.array().of(yup.string()).default([]),
  result: yup.mixed<ResultEnum>(),
  nextAction: yup.mixed<ActivityTypeEnum>().nullable(),
  // These field schemas should ideally be string().defined(), but Formik thinks the form is invalid
  // when those fields fields are blank for some reason, and we need to allow blank values
  location: yup.string(),
  comment: yup.string(),
});
type Attributes = yup.InferType<typeof taskSchema>;

interface Props {
  accountListId: string;
  onClose: () => void;
  defaultValues?: Partial<TaskCreateInput>;
}

const TaskModalLogForm = ({
  accountListId,
  onClose,
  defaultValues,
}: Props): ReactElement => {
  const user = useUser();
  const initialTask: Attributes = useMemo(
    () => ({
      taskType: null,
      activityType: defaultValues?.activityType ?? null,
      subject: defaultValues?.subject ?? '',
      contactIds: defaultValues?.contactIds ?? [],
      completedAt: DateTime.local(),
      // The assignee will not be set if `user` hasn't been loaded yet because we don't want to make
      // the user wait for it to load
      userId: defaultValues?.userId ?? user?.id ?? null,
      tagList: defaultValues?.tagList ?? [],
      result: defaultValues?.result ?? undefined,
      nextAction: defaultValues?.nextAction ?? null,
      location: '',
      comment: '',
    }),
    [],
  );

  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { openTaskModal } = useTaskModal();
  // TODO - Replace null with Caleb Alldrin's Contact's status
  const [phaseData, fetchPhaseData] = useGetPhaseData(null);
  const [selectedSuggestedTags, setSelectedSuggestedTags] = useState<string[]>(
    [],
  );

  const [createTasks, { loading: creating }] = useCreateTasksMutation();
  const { update } = useUpdateTasksQueries();
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const onSubmit = async ({
    completedAt,
    comment,
    ...attributes
  }: Attributes): Promise<void> => {
    if (selectedSuggestedTags.length) {
      attributes.tagList = attributes.tagList.concat(selectedSuggestedTags);
    }
    await createTasks({
      variables: {
        accountListId,
        attributes: {
          ...attributes,
          completedAt: completedAt?.toISO(),
          comment: comment?.trim(),
        },
      },
      refetchQueries: ['ContactTasksTab', 'GetWeeklyActivity'],
    });
    update();
    if (attributes.contactIds && attributes.contactIds.length > 1) {
      attributes.contactIds.forEach(() => {
        dispatch('mpdx-task-completed');
      });
    } else {
      dispatch('mpdx-task-completed');
    }
    enqueueSnackbar(t('Task(s) logged successfully'), { variant: 'success' });
    onClose();
    if (attributes.nextAction) {
      openTaskModal({
        view: 'add',
        defaultValues: {
          subject: attributes.subject,
          activityType: attributes.nextAction,
          // TODO: Use fragments to ensure all required fields are loaded
          contactIds: attributes.contactIds,
          userId: attributes.userId ?? undefined,
          tagList: attributes.tagList,
        },
      });
    }
  };

  const handleShowMoreChange = (): void => {
    setShowMore((prevState) => !prevState);
  };

  // TODO - Remove with Caleb Alldrin's function
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const updateActionOptions = () => {};

  const availableResults = phaseData ? possibleResults(phaseData) : [];

  return (
    <Formik
      initialValues={initialTask}
      validationSchema={taskSchema}
      onSubmit={onSubmit}
      validateOnMount
      enableReinitialize
    >
      {({
        values: {
          taskType,
          activityType,
          subject,
          userId,
          completedAt,
          tagList,
          contactIds,
          result,
          nextAction,
          location,
          comment,
        },
        setFieldValue,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        isValid,
        errors,
        touched,
      }): ReactElement => (
        <form onSubmit={handleSubmit} noValidate>
          <DialogContent dividers style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <FormFieldsGridContainer>
              <Grid item>
                <TextField
                  name="subject"
                  label={t('Task Name')}
                  value={subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  multiline
                  inputProps={{ 'aria-label': t('Subject') }}
                  error={!!errors.subject && touched.subject}
                  helperText={
                    errors.subject && touched.subject && t('Field is required')
                  }
                  required
                  inputRef={inputRef}
                />
              </Grid>
              {/* TODO - Replace with Caleb Alldrin's input */}
              <Grid item>
                <TaskTypeAutocomplete
                  options={Object.values(PhaseTypeEnum)}
                  label={t('Task Type')}
                  value={taskType}
                  onChange={(phase) => {
                    setFieldValue('taskType', phase);
                    setFieldValue('result', undefined);
                    updateActionOptions();
                    fetchPhaseData(phase);
                  }}
                />
              </Grid>

              <Grid item>
                <ActivityTypeAutocomplete
                  options={Object.values(ActivityTypeEnum)}
                  label={t('Action')}
                  value={activityType}
                  onChange={(activityType) => {
                    setFieldValue('activityType', activityType);
                    setFieldValue(
                      'nextAction',
                      activityType &&
                        possibleNextActions(activityType).includes(activityType)
                        ? activityType
                        : null,
                    );
                  }}
                />
              </Grid>
              {activityType === ActivityTypeEnum.Appointment && (
                <Grid item>
                  <TextField
                    label={t('Location')}
                    value={location}
                    onChange={handleChange('location')}
                    fullWidth
                    multiline
                    inputProps={{ 'aria-label': t('Location') }}
                  />
                </Grid>
              )}
              {!!availableResults.length && (
                <Grid item>
                  <FormControl fullWidth>
                    <InputLabel id="result">{t('Result')}</InputLabel>
                    <Select
                      labelId="result"
                      label={t('Result')}
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
              <Grid item>
                <ContactsAutocomplete
                  accountListId={accountListId}
                  value={contactIds}
                  onChange={(contactIds) =>
                    setFieldValue('contactIds', contactIds)
                  }
                />
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
              <Grid item>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showMore}
                      onChange={handleShowMoreChange}
                    />
                  }
                  label={t('Show More')}
                />
                <AnimatePresence>
                  {showMore && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 216, opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <Grid
                        item
                        container
                        spacing={2}
                        style={{ marginBottom: 16 }}
                      >
                        <Grid item xs={12}>
                          <TextField
                            label={t('Comment')}
                            value={comment}
                            onChange={handleChange('comment')}
                            fullWidth
                            multiline
                            inputProps={{ 'aria-label': t('Comment') }}
                          />
                        </Grid>
                        {phaseData?.resultOptions.tags && (
                          <PhaseTags
                            tags={phaseData.resultOptions.tags}
                            selectedTags={selectedSuggestedTags}
                            setSelectedTags={setSelectedSuggestedTags}
                          />
                        )}
                        <Grid item xs={12}>
                          <TagsAutocomplete
                            accountListId={accountListId}
                            type={TagTypeEnum.Tag}
                            value={tagList ?? []}
                            onChange={(tagList) =>
                              setFieldValue('tagList', tagList)
                            }
                            label={
                              phaseData?.resultOptions.tags
                                ? t('Additional Tags')
                                : ''
                            }
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <AssigneeAutocomplete
                            accountListId={accountListId}
                            value={userId}
                            onChange={(userId) =>
                              setFieldValue('userId', userId)
                            }
                          />
                        </Grid>
                        {activityType && (
                          <Grid item xs={12}>
                            <ActivityTypeAutocomplete
                              options={possibleNextActions(activityType)}
                              label={t('Next Action')}
                              value={nextAction}
                              onChange={(nextAction) =>
                                setFieldValue('nextAction', nextAction)
                              }
                            />
                          </Grid>
                        )}
                      </Grid>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Grid>
            </FormFieldsGridContainer>
          </DialogContent>
          <DialogActions>
            <CancelButton disabled={isSubmitting} onClick={onClose} />
            <SubmitButton disabled={!isValid || isSubmitting}>
              {creating && (
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

export default TaskModalLogForm;
