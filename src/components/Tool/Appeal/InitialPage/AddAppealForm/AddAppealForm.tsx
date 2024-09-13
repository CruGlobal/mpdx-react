import { useRouter } from 'next/router';
import React, { ReactElement, useMemo } from 'react';
import { mdiClose, mdiEqual, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  Skeleton,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { Field, Form, Formik, FormikProps, FormikValues } from 'formik';
import { isEqual } from 'lodash';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import * as yup from 'yup';
import {
  AppealCreateInput,
  FilterOption,
  MultiselectFilter,
} from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import removeObjectNulls from 'src/lib/removeObjectNulls';
import {
  useContactFiltersQuery,
  useContactTagsQuery,
} from './AddAppealForm.generated';
import { useCreateAppealMutation } from './CreateAppeal.generated';

export enum ExclusionEnum {
  SpecialGift = 'specialGift3months',
  JoinedTeam = 'joinedTeam3months',
  IncreasedGiving = 'increasedGiving3months',
  MissedGift = '30daysLate',
  DoNotAskAppeals = 'doNotAskAppeals',
}

export type ContactExclusion = {
  name: string;
  value: ExclusionEnum;
};
export const contactExclusions: ContactExclusion[] = [
  {
    name: i18n.t('May have given a special gift in the last 3 months'),
    value: ExclusionEnum.SpecialGift,
  },
  {
    name: i18n.t('May have joined my team in the last 3 months'),
    value: ExclusionEnum.JoinedTeam,
  },
  {
    name: i18n.t('May have increased their giving in the last 3 months'),
    value: ExclusionEnum.IncreasedGiving,
  },
  {
    name: i18n.t('May have missed a gift in the last 30-90 days'),
    value: ExclusionEnum.MissedGift,
  },
  {
    name: i18n.t('Have "Send Appeals" set to No'),
    value: ExclusionEnum.DoNotAskAppeals,
  },
];

export const calculateGoal = (
  initialGoal: number,
  letterCost: number,
  adminPercentage: number,
): number => {
  const adminPercent = 1 - adminPercentage / 100;

  return Math.round(((initialGoal + letterCost) / adminPercent) * 100) / 100;
};

const gqlStatusesToDBStatusMap: { [key: string]: string } = {
  NULL: 'null',
  ACTIVE: 'active',
  HIDDEN: 'hidden',
  NEVER_CONTACTED: 'never_contacted',
  ASK_IN_FUTURE: 'ask_in_future',
  CULTIVATE_RELATIONSHIP: 'cultivate_relationship',
  CONTACT_FOR_APPOINTMENT: 'contact_for_appointment',
  APPOINTMENT_SCHEDULED: 'appointment_scheduled',
  CALL_FOR_DECISION: 'call_for_decision',
  PARTNER_FINANCIAL: 'partner_financial',
  PARTNER_SPECIAL: 'partner_special',
  PARTNER_PRAY: 'partner_pray',
  NOT_INTERESTED: 'not_interested',
  UNRESPONSIVE: 'unresponsive',
  NEVER_ASK: 'never_ask',
  RESEARCH_ABANDONED: 'research_abandoned',
  EXPIRED_REFERRAL: 'expired_referral',
  RESEARCH_CONTACT_INFO: 'research_contact_info',
};

type BuildInclusionFilterProps = {
  appealIncludes: object;
  tags: Attributes['tags'];
  statuses: Attributes['statuses'];
};
export const buildInclusionFilter = ({
  appealIncludes,
  tags,
  statuses,
}: BuildInclusionFilterProps): object => {
  const defaultInclusionFilter = {
    any_tags: true,
  };

  const dbStatues =
    statuses && statuses.length
      ? statuses
          .map((status) =>
            status.value ? gqlStatusesToDBStatusMap[status.value] : '',
          )
          .join(',')
      : null;
  const inclusionFilter = removeObjectNulls({
    ...defaultInclusionFilter,
    tags: tags && tags.length ? tags.join(',') : null,
    status: dbStatues,
    ...appealIncludes,
  });

  return isEqual(inclusionFilter, defaultInclusionFilter)
    ? {}
    : inclusionFilter;
};

export const buildExclusionFilter = (
  exclusions: Attributes['exclusions'],
): object => {
  if (!exclusions || !exclusions.length) {
    return {};
  }
  const today = DateTime.local().toFormat('yyyy-MM-dd');
  const threeMonthsAgo = DateTime.local()
    .minus({ months: 3 })
    .toFormat('yyyy-MM-dd');
  const containsExclusion = (exclusionValue: ExclusionEnum) => {
    return exclusions?.find((exclusion) => exclusion.value === exclusionValue);
  };

  return removeObjectNulls({
    started_giving_range: containsExclusion(ExclusionEnum.JoinedTeam)
      ? `${threeMonthsAgo}..${today}`
      : null,
    gave_more_than_pledged_range: containsExclusion(ExclusionEnum.SpecialGift)
      ? `${threeMonthsAgo}..${today}`
      : null,
    pledge_amount_increased_range: containsExclusion(
      ExclusionEnum.IncreasedGiving,
    )
      ? `${threeMonthsAgo}..${today}`
      : null,
    pledge_late_by: containsExclusion(ExclusionEnum.MissedGift)
      ? '30_90'
      : null,
    no_appeals: containsExclusion(ExclusionEnum.DoNotAskAppeals) ? true : null,
  });
};

const isPositiveInteger = (value: number | undefined) =>
  typeof value === 'number' && value >= 0 && value === Math.floor(value);

const appealFormSchema = yup.object({
  name: yup.string().required('Please enter a name'),
  initialGoal: yup
    .number()
    .typeError(i18n.t('Initial Goal must be a valid number'))
    .required(i18n.t('Initial Goal is required'))
    .test(
      i18n.t('Is positive?'),
      i18n.t('Must use a positive whole number for Initial Goal'),
      isPositiveInteger,
    ),
  letterCost: yup
    .number()
    .typeError(i18n.t('Letter Cost must be a valid number'))
    .required(i18n.t('Letter Cost is required'))
    .test(
      i18n.t('Is positive?'),
      i18n.t('Must use a positive whole number for Letter Cost'),
      isPositiveInteger,
    ),
  adminPercentage: yup
    .number()
    .typeError(i18n.t('Admin Cost must be a valid number'))
    .required(i18n.t('Admin Cost is required'))
    .test(
      i18n.t('Is positive?'),
      i18n.t('Must use a positive whole number for Admin Cost'),
      isPositiveInteger,
    ),
  statuses: yup.array().of(
    yup.object({
      name: yup.string(),
      value: yup.string(),
    }),
  ),
  tags: yup.array().of(yup.string()),
  exclusions: yup.array().of(
    yup.object({
      name: yup.string(),
      value: yup.string(),
    }),
  ),
});
type Attributes = yup.InferType<typeof appealFormSchema>;

type FormikRefType = React.RefObject<
  FormikProps<{
    name: string;
    initialGoal: number;
    letterCost: number;
    adminPercentage: number;
    statuses: Pick<FilterOption, 'name' | 'value'>[];
    tags: never[];
    exclusions: ContactExclusion[];
  }>
>;

const useStyles = makeStyles()((theme: Theme) => ({
  loadingIndicator: {
    margin: theme.spacing(0, 1, 0, 0),
  },
  input: {
    width: '100%',
  },
  form: {
    width: '100%',
  },
  submitButton: {
    backgroundColor: theme.palette.mpdxBlue.main,
    width: '150px',
    color: 'white',
  },
  selectAll: {
    color: theme.palette.mpdxBlue.main,
    marginLeft: 5,
    '&:hover': {
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  },
}));

export interface AddAppealFormProps {
  accountListId: string;
  appealName?: string;
  appealGoal?: number;
  appealStatuses?: Pick<FilterOption, 'name' | 'value'>[];
  appealExcludes?: ContactExclusion[];
  appealIncludes?: object;
  formRef?: React.MutableRefObject<FormikValues | undefined>;
}

const AddAppealForm: React.FC<AddAppealFormProps> = ({
  accountListId,
  appealName,
  appealGoal,
  appealStatuses,
  appealExcludes,
  appealIncludes = {},
  formRef,
}) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { push } = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { data: contactFilterTags, loading: loadingTags } = useContactTagsQuery(
    {
      variables: { accountListId },
    },
  );
  const { data: contactFilterGroups, loading: loadingStatuses } =
    useContactFiltersQuery({
      variables: {
        accountListId,
      },
      context: {
        doNotBatch: true,
      },
    });
  const [createNewAppeal, { loading: updating }] = useCreateAppealMutation();

  const contactStatuses = useMemo(() => {
    if (contactFilterGroups?.accountList?.contactFilterGroups) {
      return (
        contactFilterGroups.accountList.contactFilterGroups
          .find((group) => group?.filters[0]?.filterKey === 'status')
          ?.filters.find(
            (filter: { filterKey: string }) => filter.filterKey === 'status',
          ) as MultiselectFilter
      ).options;
    } else {
      return [{ name: '', value: '' }];
    }
  }, [contactFilterGroups]);

  const onSubmit = async (props: Attributes) => {
    const attributes: AppealCreateInput = {
      name: props.name,
      amount: calculateGoal(
        props.initialGoal,
        props.letterCost,
        props.adminPercentage,
      ),
    };

    const inclusionFilter = buildInclusionFilter({
      appealIncludes,
      tags: props.tags,
      statuses: props.statuses,
    });
    if (!isEqual(inclusionFilter, {})) {
      attributes.inclusionFilter = inclusionFilter;
    }
    const exclusionFilter = buildExclusionFilter(props.exclusions);
    if (!isEqual(exclusionFilter, {})) {
      attributes.exclusionFilter = exclusionFilter;
    }

    await createNewAppeal({
      variables: {
        accountListId,
        attributes,
      },
      onCompleted: (data) => {
        push(
          `/accountLists/${accountListId}/tools/appeals/appeal/${data?.createAppeal?.appeal?.id}/list/tour`,
        );
      },
    });
    enqueueSnackbar(t('Appeal successfully added!'), {
      variant: 'success',
    });
  };

  const contactTagsList = contactFilterTags?.accountList.contactTagList ?? [];

  const handleSelectAllStatuses = (setFieldValue) => {
    setFieldValue(
      'statuses',
      contactStatuses?.filter(
        (status: { value: string }) =>
          status.value !== 'ACTIVE' && status.value !== 'HIDDEN',
      ),
    );
  };

  const handleSelectAllTags = (setFieldValue) => {
    setFieldValue('tags', contactTagsList);
  };

  return (
    <Formik
      initialValues={{
        name: appealName ?? '',
        initialGoal: appealGoal ?? 0,
        letterCost: 0,
        adminPercentage: 12,
        statuses: appealStatuses ?? [],
        tags: [],
        exclusions: appealExcludes ?? [],
      }}
      onSubmit={async (values) => {
        await onSubmit(values);
      }}
      validationSchema={appealFormSchema}
      innerRef={formRef as FormikRefType}
    >
      {({
        values: {
          initialGoal,
          letterCost,
          adminPercentage,
          statuses,
          tags,
          exclusions,
        },
        handleSubmit,
        setFieldValue,
        isSubmitting,
        isValid,
        errors,
      }): ReactElement => (
        <Form className={classes.form} onSubmit={handleSubmit}>
          <Box mb={2}>
            <FormControl fullWidth>
              <Field
                error={errors.name}
                helperText={errors.name}
                label={t('Name')}
                placeholder={t('Appeal Name')}
                name="name"
                type="input"
                variant="outlined"
                className={classes.input}
                as={TextField}
                inputProps={{ 'data-testid': 'nameInput' }}
              />
            </FormControl>
          </Box>
          <Box mt={1} mb={1}>
            <Grid container spacing={0}>
              <Grid item xs={12} sm={2}>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="start"
                >
                  <Field
                    name="initialGoal"
                    label={t('Initial Goal')}
                    data-testid="initialGoalInput"
                    type="number"
                    variant="outlined"
                    size="small"
                    className={classes.input}
                    error={errors.initialGoal}
                    helperText={errors.initialGoal}
                    as={TextField}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={1}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    height: '100%',
                  }}
                >
                  <Icon path={mdiPlus} size={1} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="start"
                >
                  <Field
                    name="letterCost"
                    type="number"
                    variant="outlined"
                    label={t('Letter Cost')}
                    size="small"
                    className={classes.input}
                    error={errors.letterCost}
                    helperText={errors.letterCost}
                    as={TextField}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={1}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    height: '100%',
                  }}
                >
                  <Icon path={mdiClose} size={1} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="start"
                >
                  <Field
                    name="adminPercentage"
                    type="number"
                    variant="outlined"
                    label={t('Admin %')}
                    size="small"
                    className={classes.input}
                    error={errors.adminPercentage}
                    helperText={errors.adminPercentage}
                    as={TextField}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={1}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    height: '100%',
                  }}
                >
                  <Icon path={mdiEqual} size={1} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="start"
                >
                  <TextField
                    data-testid="goalInput"
                    name="goal"
                    type="number"
                    label={t('Goal')}
                    variant="outlined"
                    size="small"
                    className={classes.input}
                    value={calculateGoal(
                      initialGoal,
                      letterCost,
                      adminPercentage,
                    ).toFixed(2)}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Alert severity="info">
            {t(
              'You can add contacts to your appeal based on their status and/or tags. You can also add additional contacts individually at a later time.',
            )}
          </Alert>
          <Box mt={1} mb={1}>
            <Typography display="inline">
              {t('Add contacts with the following status(es):')}
            </Typography>
            {!!contactStatuses && (
              <Typography
                display="inline"
                className={classes.selectAll}
                onClick={() => handleSelectAllStatuses(setFieldValue)}
                data-testid="contactStatusSelect-selectAll"
              >
                {t('select all')}
              </Typography>
            )}

            {loadingStatuses && <Skeleton height={40} />}

            {!!contactStatuses && !loadingStatuses && (
              <Autocomplete
                multiple
                autoHighlight
                data-testid="contactStatusSelect"
                id="tags-standard"
                filterSelectedOptions
                options={contactStatuses}
                getOptionLabel={(option) => option.name}
                value={statuses}
                onChange={(_event, values) => setFieldValue('statuses', values)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    placeholder={t('Select Some Options')}
                  />
                )}
              />
            )}
          </Box>

          <Box mt={1} mb={1}>
            <Typography display="inline">
              {t('Add contacts with the following tag(s):')}
            </Typography>
            {!!contactTagsList.length && (
              <Typography
                display="inline"
                className={classes.selectAll}
                onClick={() => handleSelectAllTags(setFieldValue)}
                data-testid="contactTagsSelect-selectAll"
              >
                {t('select all')}
              </Typography>
            )}

            {loadingTags && <Skeleton height={40} />}

            {contactTagsList && !loadingTags && (
              <Autocomplete
                multiple
                autoHighlight
                data-testid="contactTagsSelect"
                id="tags-standard"
                filterSelectedOptions
                options={contactTagsList}
                getOptionLabel={(option) => option}
                value={tags}
                onChange={(_event, values) => setFieldValue('tags', values)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    placeholder={t('Select Some Options')}
                  />
                )}
              />
            )}
          </Box>
          <Box mt={1} mb={1}>
            <Typography>{t('Do not add contacts who:')}</Typography>
            <Autocomplete
              multiple
              autoHighlight
              data-testid="exclusionsSelect"
              id="exclusions-standard"
              filterSelectedOptions
              options={contactExclusions}
              getOptionLabel={(option) => option.name}
              value={exclusions}
              onChange={(_event, values) => setFieldValue('exclusions', values)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  size="small"
                  placeholder={t('Select Some Options')}
                />
              )}
            />
          </Box>

          {[errors.statuses, errors.tags, errors.exclusions].map(
            (error, idx) => {
              if (error && typeof error === 'string') {
                return (
                  <Alert severity="error" key={`error-${idx}`}>
                    {error}
                  </Alert>
                );
              }
            },
          )}

          {/* As this form can be added a modal, we allow the modal to submit the form through a ref.
          (The modal will have their own submit button that will call submit.)
          However, if you're using the form as normally, the below buttons will show and you don't have to touch ref. */}
          {!formRef && (
            <Box mt={2} mb={1}>
              <Button
                type="submit"
                variant="contained"
                className={classes.submitButton}
                disabled={!isValid || isSubmitting}
              >
                {updating && (
                  <CircularProgress
                    className={classes.loadingIndicator}
                    color="primary"
                    size={20}
                  />
                )}
                {t('Add Appeal')}
              </Button>
            </Box>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default AddAppealForm;
