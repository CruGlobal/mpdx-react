import {
  Box,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  makeStyles,
  Button,
  Grid,
  Theme,
  CircularProgress,
  styled,
  FormControl,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Formik, Field, Form } from 'formik';
import React, { ReactElement, useState } from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiClose, mdiEqual } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import i18n from 'i18next';
import theme from '../../../../src/theme';
import AnimatedCard from '../../../../src/components/AnimatedCard';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import { contactTags } from '../FixCommitmentInfo/InputOptions/ContactTags';
import { useCreateAppealMutation } from './CreateAppeal.generated';
import { useGetContactTagsQuery } from './GetContactTags.generated';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

const useStyles = makeStyles((theme: Theme) => ({
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
  blueBox: {
    border: '1px solid',
    borderColor: theme.palette.mpdxBlue.main,
    borderRadius: 5,
    backgroundColor: theme.palette.cruGrayLight.main,
    color: theme.palette.mpdxBlue.main,
    padding: 10,
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

interface formProps {
  name: string;
  initialGoal: number;
  letterCost: number;
  adminCost: number;
}

const contactExclusions = [
  {
    title: i18n.t('May have given a special gift in the last 3 months'),
    value: 'SPECIAL_GIFT',
  },
  {
    title: i18n.t('May have joined my team in the last 3 months'),
    value: 'JOINED_TEAM',
  },
  {
    title: i18n.t('May have increased their giving in the last 3 months'),
    value: 'INCREASED_GIVING',
  },
  {
    title: i18n.t('May have missed a gift in the last 30-90 days'),
    value: 'MISSED_GIFT',
  },
  {
    title: i18n.t('Have "Send Appeals" set to No'),
    value: 'NO_APPEALS',
  },
];

const AddAppealForm = (): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();
  const accountListId = useAccountListId() || '';
  const { enqueueSnackbar } = useSnackbar();
  const { data, loading } = useGetContactTagsQuery({
    variables: { accountListId },
  });
  const [filterTags, setFilterTags] = useState<{
    statuses: { title: string; value: string }[];
    tags: string[];
    exclusions: { title: string; value: string }[];
  }>({
    statuses: [],
    tags: [],
    exclusions: [],
  });
  const [createNewAppeal, { loading: updating }] = useCreateAppealMutation();

  const calculateGoal = (
    initialGoal: number,
    letterCost: number,
    adminCost: number,
  ): number => {
    return (initialGoal + letterCost) * (1 + adminCost / 100);
  };

  const handleChange = (
    values: { title: string; value: string }[] | string[],
    props: string,
  ): void => {
    setFilterTags((prevState) => ({
      ...prevState,
      [props]: values,
    }));
  };

  const onSubmit = async (props: formProps) => {
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
    });
    enqueueSnackbar(t('Appeal successfully added!'), {
      variant: 'success',
    });
  };

  const appealFormSchema = yup.object({
    name: yup.string().required('Please enter a name'),
  });

  const contactStatusesFormatted = Object.entries(
    contactTags,
  ).map(([tag, translatedTag]) => ({ value: tag, title: translatedTag }));

  const contactTagsList = data?.accountList.contactTagList ?? [];

  const selectAllStatuses = (): void => {
    setFilterTags((prevState) => ({
      ...prevState,
      statuses: contactStatusesFormatted.slice(
        0,
        contactStatusesFormatted.length - 2,
      ),
    }));
  };

  const selectAllTags = (): void => {
    setFilterTags((prevState) => ({
      ...prevState,
      tags: contactTagsList,
    }));
  };

  return loading ? (
    <CircularProgress />
  ) : (
    <Box m={1}>
      <AnimatedCard>
        <CardHeader
          title="Add Appeal"
          style={{
            backgroundColor: theme.palette.cruGrayLight.main,
            borderBottom: '1px solid',
            borderColor: theme.palette.cruGrayMedium.main,
          }}
        />
        <CardContent>
          <Formik
            initialValues={{
              name: '',
              initialGoal: 0,
              letterCost: 0,
              adminCost: 12,
            }}
            onSubmit={onSubmit}
            validationSchema={appealFormSchema}
          >
            {({
              values: { initialGoal, letterCost, adminCost },
              handleSubmit,
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
                      size="small"
                      className={classes.input}
                      as={TextField}
                    />
                  </FormControl>
                </Box>
                <Box mt={1} mb={1}>
                  <Grid container spacing={0}>
                    <Grid item xs={12} md={2}>
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
                          as={TextField}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={1}>
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
                    <Grid item xs={12} md={2}>
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
                          as={TextField}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={1}>
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
                    <Grid item xs={12} md={2}>
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
                          as={TextField}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={1}>
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
                    <Grid item xs={12} md={3}>
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
                <Box mt={2} mb={1} className={classes.blueBox}>
                  <Typography variant="body2">
                    {t(
                      'You can add contacts to your appeal based on their status and/or tags. You can also add additional contacts individually at a later time.',
                    )}
                  </Typography>
                </Box>
                <Box mt={1} mb={1}>
                  <Typography variant="h6" display="inline">
                    {t('Add contacts with the following status(es):')}
                  </Typography>
                  <Typography
                    variant="h6"
                    display="inline"
                    className={classes.selectAll}
                    onClick={selectAllStatuses}
                  >
                    {t('select all')}
                  </Typography>
                  <Autocomplete
                    multiple
                    id="tags-standard"
                    options={contactStatusesFormatted.filter(
                      ({ value: id1 }) =>
                        !filterTags.statuses.some(
                          ({ value: id2 }) => id2 === id1,
                        ),
                    )}
                    getOptionLabel={(option) => option.title}
                    value={filterTags.statuses}
                    onChange={({}, values) => handleChange(values, 'statuses')}
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
                {contactTagsList && contactTagsList.length > 0 && (
                  <Box mt={1} mb={1}>
                    <Typography variant="h6" display="inline">
                      {t('Add contacts with the following tag(s):')}
                    </Typography>
                    <Typography
                      variant="h6"
                      display="inline"
                      className={classes.selectAll}
                      onClick={selectAllTags}
                    >
                      {t('select all')}
                    </Typography>
                    <Autocomplete
                      multiple
                      id="tags-standard"
                      options={contactTagsList.filter(
                        (tag1) =>
                          !filterTags.tags.some((tag2) => tag2 === tag1),
                      )}
                      getOptionLabel={(option) => option}
                      value={filterTags.tags}
                      onChange={({}, values) => handleChange(values, 'tags')}
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
                )}
                <Box mt={1} mb={1}>
                  <Typography variant="h6">
                    {t('Do not add contacts who:')}
                  </Typography>
                  <Autocomplete
                    multiple
                    id="tags-standard"
                    options={contactExclusions.filter(
                      ({ value: id1 }) =>
                        !filterTags.exclusions.some(
                          ({ value: id2 }) => id2 === id1,
                        ),
                    )}
                    getOptionLabel={(option) => option.title}
                    value={filterTags.exclusions}
                    onChange={({}, values) =>
                      handleChange(values, 'exclusions')
                    }
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
              </Form>
            )}
          </Formik>
        </CardContent>
      </AnimatedCard>
    </Box>
  );
};

export default AddAppealForm;
