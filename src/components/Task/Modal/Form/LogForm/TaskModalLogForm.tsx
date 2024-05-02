import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
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
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import {
  ActivityTypeEnum,
  DisplayResultEnum,
  Phase,
  PhaseEnum,
  ResultEnum,
  StatusEnum,
  TaskCreateInput,
} from 'src/graphql/types.generated';
import { useGetPhaseData } from 'src/hooks/useContactPhaseData';
import useTaskModal from 'src/hooks/useTaskModal';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';
import { dispatch } from 'src/lib/analytics';
import { nullableDateTime } from 'src/lib/formikHelpers';
import { getLocalizedResultString } from 'src/utils/functions/getLocalizedResultStrings';
import { getValueFromIdValue } from 'src/utils/phases/getValueFromIdValue';
import { isAppointmentActivityType } from 'src/utils/phases/isAppointmentActivityType';
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
import { TaskPhaseAutocomplete } from '../Inputs/TaskPhaseAutocomplete/TaskPhaseAutocomplete';
import { possibleNextActions } from '../PossibleNextActions';
import { possiblePartnerStatus } from '../PossiblePartnerStatus';
import { possibleResults } from '../PossibleResults';
import {
  useCreateTasksMutation,
  useUpdateContactStatusMutation,
} from '../TaskModal.generated';
import {
  handleResultChange,
  handleTaskActionChange,
  handleTaskPhaseChange,
} from '../TaskModalHelper';

const taskSchema = yup.object({
  taskPhase: yup.mixed<PhaseEnum>().nullable(),
  activityType: yup.mixed<ActivityTypeEnum>().nullable(),
  subject: yup.string().required(),
  contactIds: yup.array().of(yup.string()).default([]),
  completedAt: nullableDateTime(),
  userId: yup.string().nullable(),
  tagList: yup.array().of(yup.string()).default([]),
  result: yup.mixed<ResultEnum>(),
  changeContactStatus: yup.boolean(),
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

const getResultDbValue = (
  phaseData: Phase | null,
  displayResult?: DisplayResultEnum | ResultEnum,
  activityType?: ActivityTypeEnum | null,
): ResultEnum => {
  if (!displayResult || !phaseData || !activityType) {
    return ResultEnum.None;
  }
  const resultOption = phaseData?.results?.resultOptions?.find(
    (result) => result.name === displayResult,
  );

  const dbResult = resultOption?.dbResult?.find(
    (item) => item.task === activityType,
  );
  return dbResult?.result || ResultEnum.None;
};

const TaskModalLogForm = ({
  accountListId,
  onClose,
  defaultValues,
}: Props): ReactElement => {
  const session = useSession();
  const initialTask: Attributes = useMemo(
    () => ({
      taskPhase: null,
      activityType: defaultValues?.activityType ?? null,
      subject: defaultValues?.subject ?? '',
      contactIds: defaultValues?.contactIds ?? [],
      completedAt: DateTime.local(),
      userId: defaultValues?.userId ?? session.data?.user.userID ?? null,
      tagList: defaultValues?.tagList ?? [],
      result: defaultValues?.result ?? undefined,
      changeContactStatus: false,
      nextAction: defaultValues?.nextAction ?? null,
      location: '',
      comment: '',
    }),
    [],
  );
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  // TODO replace with ResultEnum when available
  const [resultSelected, setResultSelected] =
    useState<DisplayResultEnum | null>(null);

  const [actionSelected, setActionSelected] = useState<ActivityTypeEnum | null>(
    null,
  );

  const { enqueueSnackbar } = useSnackbar();
  const { openTaskModal } = useTaskModal();
  const { phaseData, setPhaseId, constants } = useGetPhaseData();
  const [selectedSuggestedTags, setSelectedSuggestedTags] = useState<string[]>(
    [],
  );

  const [createTasks, { loading: creating }] = useCreateTasksMutation();
  const [updateContactStatus] = useUpdateContactStatusMutation();
  const { update } = useUpdateTasksQueries();
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const onSubmit = async (
    { completedAt, comment, ...attributes }: Attributes,
    suggestedPartnerStatus?: StatusEnum | null,
  ): Promise<void> => {
    if (selectedSuggestedTags.length) {
      attributes.tagList = attributes.tagList.concat(selectedSuggestedTags);
    }

    if (attributes.result) {
      attributes.result = getResultDbValue(
        phaseData,
        attributes.result,
        attributes.activityType,
      );
    }

    // TODO - remove this when Caleb and the API has been
    delete attributes.taskPhase;
    // TODO - remove this when NewResultEnum are added
    attributes.result = ResultEnum.Completed;

    const updatingContactStatus =
      attributes.changeContactStatus && !!suggestedPartnerStatus;

    delete attributes.changeContactStatus;

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

    if (updatingContactStatus) {
      try {
        await Promise.all(
          attributes.contactIds.map((contactID) =>
            updateContactStatus({
              variables: {
                accountListId,
                attributes: {
                  id: contactID,
                  status: suggestedPartnerStatus,
                },
              },
            }),
          ),
        );
        enqueueSnackbar(t('Updated contact(s) status successfully'), {
          variant: 'success',
        });
      } catch {
        enqueueSnackbar(t('Error while updating contact(s) status'), {
          variant: 'error',
        });
      }
    }
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

  const availableResults = useMemo(
    () => possibleResults(phaseData),
    [phaseData],
  );
  const partnerStatus = useMemo(
    () => possiblePartnerStatus(phaseData, resultSelected, actionSelected),
    [phaseData, resultSelected, actionSelected],
  );

  const nextActions = useMemo(
    () => possibleNextActions(phaseData, resultSelected, actionSelected),
    [phaseData, resultSelected, actionSelected],
  );

  const phaseTags = useMemo(
    () =>
      phaseData?.results?.tags?.map((tag) => getValueFromIdValue(tag)) || [],
    [phaseData],
  );

  return (
    <Formik
      initialValues={initialTask}
      validationSchema={taskSchema}
      onSubmit={async (values) => {
        await onSubmit(values, partnerStatus?.suggestedContactStatus);
      }}
      validateOnMount
      enableReinitialize
    >
      {({
        values: {
          taskPhase,
          activityType,
          subject,
          userId,
          completedAt,
          tagList,
          contactIds,
          result,
          changeContactStatus,
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
                <TaskPhaseAutocomplete
                  options={Object.values(PhaseEnum)}
                  label={t('Task Type *')}
                  value={taskPhase}
                  onChange={(phase) =>
                    handleTaskPhaseChange({
                      phase,
                      setFieldValue,
                      setResultSelected,
                      setActionSelected,
                      setPhaseId,
                      setSelectedSuggestedTags,
                    })
                  }
                />
              </Grid>

              <Grid item>
                <ActivityTypeAutocomplete
                  options={Object.values(ActivityTypeEnum)}
                  label={t('Action *')}
                  value={activityType}
                  phaseType={phaseData?.id}
                  onChange={(activityType) => {
                    handleTaskActionChange({
                      activityType,
                      setFieldValue,
                      setActionSelected,
                      constants,
                    });
                  }}
                />
              </Grid>

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

              {isAppointmentActivityType(activityType) && (
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
                      onChange={(e) => {
                        handleResultChange({
                          result: e.target.value,
                          setFieldValue,
                          setResultSelected,
                        });
                      }}
                    >
                      {availableResults.map((result) => {
                        return (
                          <MenuItem key={result} value={result}>
                            {getLocalizedResultString(t, result)}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {partnerStatus?.suggestedContactStatus && (
                <Grid item>
                  <FormControl fullWidth>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={changeContactStatus}
                          name="changeContactStatus"
                          onChange={handleChange}
                        />
                      }
                      label={t("Change the contact's status to: {{status}}", {
                        status: partnerStatus.suggestedContactStatus,
                      })}
                    />
                    {contactIds.length > 1 && (
                      <FormHelperText>
                        {t(
                          'This will change the contact status for {{amount}} contacts',
                          {
                            amount: contactIds.length,
                          },
                        )}
                      </FormHelperText>
                    )}
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
                        {!!phaseTags?.length && (
                          <PhaseTags
                            tags={phaseTags}
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
                              phaseTags?.length ? t('Additional Tags') : ''
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
                              options={nextActions}
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
