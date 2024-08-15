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
import { styled } from '@mui/material/styles';
import { Field, Form, Formik, FormikProps, FormikValues } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import * as yup from 'yup';
import { useContactFiltersQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  GetAppealsDocument,
  GetAppealsQuery,
} from 'pages/accountLists/[accountListId]/tools/GetAppeals.generated';
import { FilterOption, MultiselectFilter } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { useCreateAppealMutation } from './CreateAppeal.generated';
import { useGetContactTagsQuery } from './GetContactTags.generated';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

const useStyles = makeStyles()((theme: Theme) => ({
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

interface FormAttributes {
  name: string;
  initialGoal: number;
  letterCost: number;
  adminCost: number;
}

export type ContactExclusion = {
  name: string;
  value: string;
};

export const contactExclusions: ContactExclusion[] = [
  {
    name: i18n.t('May have given a special gift in the last 3 months'),
    value: 'SPECIAL_GIFT',
  },
  {
    name: i18n.t('May have joined my team in the last 3 months'),
    value: 'JOINED_TEAM',
  },
  {
    name: i18n.t('May have increased their giving in the last 3 months'),
    value: 'INCREASED_GIVING',
  },
  {
    name: i18n.t('May have missed a gift in the last 30-90 days'),
    value: 'MISSED_GIFT',
  },
  {
    name: i18n.t('Have "Send Appeals" set to No'),
    value: 'NO_APPEALS',
  },
];

const calculateGoal = (
  initialGoal: number,
  letterCost: number,
  adminCost: number,
): number => {
  return (initialGoal + letterCost) * (1 + adminCost / 100);
};

const appealFormSchema = yup.object({
  name: yup.string().required('Please enter a name'),
  initialGoal: yup.number().required(),
  letterCost: yup.number().required(),
  adminCost: yup.number().required(),
  statuses: yup.array().of(
    yup.object({
      __typename: yup.string(),
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
interface AddAppealFormProps {
  accountListId: string;
  appealName?: string;
  appealGoal?: number;
  appealStatuses?: FilterOption[];
  appealExcludes?: ContactExclusion[];
  formRef?: React.MutableRefObject<FormikValues | undefined>;
}

type FormikRefType = React.RefObject<
  FormikProps<{
    name: string;
    initialGoal: number;
    letterCost: number;
    adminCost: number;
    statuses: FilterOption[];
    tags: never[];
    exclusions: ContactExclusion[];
  }>
>;

const AddAppealForm: React.FC<AddAppealFormProps> = ({
  accountListId,
  appealName,
  appealGoal,
  appealStatuses,
  appealExcludes,
  formRef,
}) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { data: contactFilterTags, loading: loadingTags } =
    useGetContactTagsQuery({
      variables: { accountListId },
    });
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

  const onSubmit = async (props: FormAttributes, resetForm: () => void) => {
    const attributes = {
      name: props.name,
      amount: calculateGoal(
        props.initialGoal,
        props.letterCost,
        props.adminCost,
      ),
    };

    await createNewAppeal({
      variables: {
        accountListId,
        attributes,
      },
      update: (cache, result) => {
        const query = {
          query: GetAppealsDocument,
          variables: { accountListId },
        };
        const dataFromCache = cache.readQuery<GetAppealsQuery>(query);
        if (dataFromCache && result.data?.createAppeal?.appeal) {
          const data = {
            regularAppeals: {
              ...dataFromCache.regularAppeals,
              nodes: [
                { ...result.data.createAppeal.appeal },
                ...dataFromCache.regularAppeals.nodes,
              ],
            },
          };
          cache.writeQuery({ ...query, data });
        }
      },
    });
    enqueueSnackbar(t('Appeal successfully added!'), {
      variant: 'success',
    });
    resetForm();
  };

  const contactTagsList = contactFilterTags?.accountList.contactTagList ?? [];

  const handleSelectAllStatuses = (setFieldValue) => {
    setFieldValue(
      'statuses',
      contactStatuses?.filter(
        (status: { value: string }) =>
          status.value !== 'ACTIVE' &&
          status.value !== 'HIDDEN' &&
          status.value !== 'NULL',
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
        adminCost: 12,
        statuses: appealStatuses ?? [],
        tags: [],
        exclusions: appealExcludes ?? [],
      }}
      onSubmit={async (values, { resetForm }) => {
        await onSubmit(values, resetForm);
      }}
      validationSchema={appealFormSchema}
      innerRef={formRef as FormikRefType}
    >
      {({
        values: {
          initialGoal,
          letterCost,
          adminCost,
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
                data-testid="nameInput"
                label={t('Name')}
                placeholder={t('Appeal Name')}
                name="name"
                type="input"
                variant="outlined"
                className={classes.input}
                as={TextField}
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
                    name="adminCost"
                    type="number"
                    variant="outlined"
                    label={t('Admin %')}
                    size="small"
                    className={classes.input}
                    error={errors.adminCost}
                    helperText={errors.adminCost}
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
                      adminCost,
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
              >
                {t('select all')}
              </Typography>
            )}

            {loadingStatuses && <Skeleton height={40} />}

            {!!contactStatuses && !loadingStatuses && (
              <Autocomplete
                multiple
                autoHighlight
                id="tags-standard"
                options={contactStatuses.filter(
                  ({ value: id1 }) =>
                    !statuses?.some(({ value: id2 }) => id2 === id1),
                )}
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
              >
                {t('select all')}
              </Typography>
            )}

            {loadingTags && <Skeleton height={40} />}

            {contactTagsList && !loadingTags && (
              <Autocomplete
                multiple
                autoHighlight
                id="tags-standard"
                options={contactTagsList.filter(
                  (tag1) => !tags.some((tag2) => tag2 === tag1),
                )}
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
              id="exclusions-standard"
              options={contactExclusions.filter(
                ({ value: id1 }) =>
                  !exclusions.some(({ value: id2 }) => id2 === id1),
              )}
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

          {!formRef && (
            <Box mt={2} mb={1}>
              <Button
                type="submit"
                variant="contained"
                className={classes.submitButton}
                disabled={!isValid || isSubmitting}
              >
                {updating && <LoadingIndicator color="primary" size={20} />}
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
