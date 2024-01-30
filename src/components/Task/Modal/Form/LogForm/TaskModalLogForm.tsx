import React, {
  ChangeEventHandler,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Schedule from '@mui/icons-material/Schedule';
import {
  Autocomplete,
  Chip,
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
  Switch,
  TextField,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Formik } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import { debounce } from 'lodash/fp';
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
import { useLocale } from 'src/hooks/useLocale';
import useTaskModal from 'src/hooks/useTaskModal';
import { useUpdateTasksQueries } from 'src/hooks/useUpdateTasksQueries';
import { dispatch } from 'src/lib/analytics';
import { getDateFormatPattern } from 'src/lib/intlFormat/intlFormat';
import { getLocalizedResultString } from 'src/utils/functions/getLocalizedResultStrings';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import theme from '../../../../../theme';
import { FormFieldsGridContainer } from '../Container/FormFieldsGridContainer';
import { possibleNextActions } from '../PossibleNextActions';
import { possibleResults } from '../PossibleResults';
import {
  useCreateTasksMutation,
  useGetDataForTaskModalQuery,
  useGetTaskModalContactsFilteredQuery,
} from '../TaskModal.generated';

const taskSchema = yup.object({
  activityType: yup.mixed<ActivityTypeEnum>().nullable(),
  subject: yup.string().required(),
  contactIds: yup.array().of(yup.string()).default([]),
  completedAt: yup.string().nullable(),
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

interface NextActionsSectionProps {
  activityType: ActivityTypeEnum;
  nextAction: ActivityTypeEnum | undefined | null;
  setFieldValue: (
    field: string,
    value: string | null,
    shouldValidate?: boolean | undefined,
  ) => void;
}

const NextActionsSection: React.FC<NextActionsSectionProps> = ({
  activityType,
  nextAction,
  setFieldValue,
}) => {
  const { t } = useTranslation();
  const availableNextActions = possibleNextActions(activityType);
  return availableNextActions.length > 0 ? (
    <Grid item xs={12}>
      <FormControl fullWidth>
        <InputLabel id="nextAction">{t('Next Action')}</InputLabel>
        <Select
          labelId="nextAction"
          label={t('Next Action')}
          value={nextAction}
          onChange={(e) => setFieldValue('nextAction', e.target.value)}
        >
          <MenuItem value={ActivityTypeEnum.None}>{t('None')}</MenuItem>
          {availableNextActions
            .filter((val) => val !== ActivityTypeEnum.None)
            .map((val) => (
              <MenuItem key={val} value={val}>
                {getLocalizedTaskType(t, val)}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Grid>
  ) : null;
};

const TaskModalLogForm = ({
  accountListId,
  onClose,
  defaultValues,
}: Props): ReactElement => {
  const initialTask: Attributes = useMemo(
    () => ({
      activityType: defaultValues?.activityType ?? null,
      subject: defaultValues?.subject ?? '',
      contactIds: defaultValues?.contactIds ?? [],
      completedAt: DateTime.local().toISO(),
      userId: defaultValues?.userId ?? null,
      tagList: defaultValues?.tagList ?? [],
      result: defaultValues?.result ?? ResultEnum.Completed,
      nextAction: defaultValues?.nextAction ?? null,
      location: '',
      comment: '',
    }),
    [],
  );

  const { t } = useTranslation();
  const locale = useLocale();
  const [showMore, setShowMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(initialTask.contactIds);
  const { enqueueSnackbar } = useSnackbar();
  const { openTaskModal } = useTaskModal();

  const { data, loading } = useGetDataForTaskModalQuery({
    variables: { accountListId },
  });
  const [createTasks, { loading: creating }] = useCreateTasksMutation();
  const { update } = useUpdateTasksQueries();
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearchTermChange = useCallback<
    ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >(
    debounce(500, (event) => {
      setSearchTerm(event.target.value);
    }),
    [],
  );

  const onSubmit = async (attributes: Attributes): Promise<void> => {
    await createTasks({
      variables: {
        accountListId,
        attributes: { ...attributes, comment: attributes.comment?.trim() },
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
    if (
      attributes.nextAction &&
      attributes.nextAction !== ActivityTypeEnum.None
    ) {
      openTaskModal({
        view: 'add',
        defaultValues: {
          activityType: attributes.nextAction,
          // TODO: Use fragments to ensure all required fields are loaded
          contactIds: attributes.contactIds,
          userId: attributes.userId ?? undefined,
          tagList: attributes.tagList,
        },
      });
    }
  };

  const { data: dataFilteredByName, loading: loadingFilteredByName } =
    useGetTaskModalContactsFilteredQuery({
      variables: {
        accountListId,
        first: 10,
        contactsFilters: { wildcardSearch: searchTerm },
      },
    });

  const { data: dataFilteredById, loading: loadingFilteredById } =
    useGetTaskModalContactsFilteredQuery({
      variables: {
        accountListId,
        first: selectedIds.length,
        contactsFilters: { ids: selectedIds },
      },
      skip: selectedIds.length === 0,
    });

  const mergedContacts =
    dataFilteredByName && dataFilteredById
      ? dataFilteredByName.contacts.nodes
          .concat(dataFilteredById.contacts.nodes)
          .filter(
            (contact1, index, self) =>
              self.findIndex((contact2) => contact2.id === contact1.id) ===
              index,
          )
      : dataFilteredById?.contacts.nodes ||
        dataFilteredByName?.contacts.nodes ||
        data?.contacts.nodes ||
        [];

  const handleShowMoreChange = (): void => {
    setShowMore((prevState) => !prevState);
  };

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
              <Grid item>
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
                    // Sort option 'None' to top of list
                    options={Object.values(ActivityTypeEnum).sort((a) =>
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
                      <TextField {...params} label={t('Action')} />
                    )}
                    onChange={(_, activity): void => {
                      setFieldValue(
                        'activityType',
                        activity === ActivityTypeEnum.None ? null : activity,
                      );
                    }}
                  />
                </FormControl>
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
              <Grid item>
                {loadingFilteredById ? (
                  <CircularProgress color="primary" size={20} />
                ) : (
                  <Autocomplete
                    multiple
                    autoSelect
                    autoHighlight
                    options={
                      (
                        mergedContacts &&
                        [...mergedContacts].sort((a, b) =>
                          a.name.localeCompare(b.name),
                        )
                      )?.map(({ id }) => id) || []
                    }
                    getOptionLabel={(contactId) =>
                      mergedContacts.find(({ id }) => id === contactId)?.name ??
                      ''
                    }
                    loading={
                      loading || loadingFilteredById || loadingFilteredByName
                    }
                    renderInput={(params): ReactElement => (
                      <TextField
                        {...params}
                        onChange={handleSearchTermChange}
                        label={t('Contacts')}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loading && (
                                <CircularProgress
                                  color="primary"
                                  size={20}
                                  data-testid="loading"
                                />
                              )}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    value={contactIds ?? undefined}
                    onChange={(_, contactIds): void => {
                      setFieldValue('contactIds', contactIds);
                      setSelectedIds(contactIds);
                    }}
                    isOptionEqualToValue={(option, value): boolean =>
                      option === value
                    }
                  />
                )}
              </Grid>
              <Grid item>
                <FormControl fullWidth>
                  <InputLabel id="result">{t('Result')}</InputLabel>
                  <Select
                    labelId="result"
                    label={t('Result')}
                    value={result}
                    onChange={(e) => setFieldValue('result', e.target.value)}
                  >
                    {activityType ? (
                      possibleResults(activityType).map((val) => (
                        <MenuItem key={val} value={val}>
                          {getLocalizedResultString(t, val)}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value={ResultEnum.Completed}>
                        {getLocalizedResultString(t, ResultEnum.Completed)}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl fullWidth>
                  <Grid container spacing={2}>
                    <Grid xs={6} item>
                      <DatePicker
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
                      <TimePicker
                        renderInput={(params) => (
                          <TextField fullWidth {...params} />
                        )}
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
                        closeOnSelect
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
                        <Grid item xs={12}>
                          <Autocomplete
                            multiple
                            autoSelect
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
                        <Grid item xs={12}>
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
                        </Grid>
                        {activityType && (
                          <NextActionsSection
                            activityType={activityType}
                            nextAction={nextAction}
                            setFieldValue={setFieldValue}
                          />
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
