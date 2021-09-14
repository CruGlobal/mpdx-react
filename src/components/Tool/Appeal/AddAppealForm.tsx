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
} from '@material-ui/core';
import { Formik, Field, Form } from 'formik';
import React, { ReactElement } from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiClose, mdiEqual } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import theme from '../../../../src/theme';
import AnimatedCard from '../../../../src/components/AnimatedCard';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import { useCreateAppealMutation } from './CreateAppeal.generated';

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

const AddAppealForm = (): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();
  const accountListId = useAccountListId() || '';
  const { enqueueSnackbar } = useSnackbar();
  const [createNewAppeal, { loading: updating }] = useCreateAppealMutation();

  const onSubmit = async (props: formProps) => {
    const attributes = {
      name: props.name,
      amount:
        (props.initialGoal + props.letterCost) * (1 + props.adminCost / 100),
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

  return (
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
                <Box mb={1}>
                  <Typography variant="h6">Name</Typography>
                  <Field
                    error={errors.name}
                    helperText={errors.name}
                    placeholder="Appeal Name"
                    name="name"
                    type="input"
                    variant="outlined"
                    size="small"
                    className={classes.input}
                    as={TextField}
                  />
                </Box>
                <Box mt={1} mb={1}>
                  <Grid container spacing={0}>
                    <Grid item xs={12} md={2}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="start"
                      >
                        <Typography>Initial Goal</Typography>
                        <Field
                          name="initialGoal"
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
                        <Typography>Letter Cost</Typography>
                        <Field
                          name="letterCost"
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
                        <Icon path={mdiClose} size={1} />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="start"
                      >
                        <Typography>Admin %</Typography>
                        <Field
                          name="adminCost"
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
                        <Icon path={mdiEqual} size={1} />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="start"
                      >
                        <Typography>Goal</Typography>
                        <TextField
                          name="goal"
                          type="number"
                          variant="outlined"
                          size="small"
                          className={classes.input}
                          value={(
                            (initialGoal + letterCost) *
                            (1 + adminCost / 100)
                          ).toFixed(2)}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                <Box mt={2} mb={1} className={classes.blueBox}>
                  <Typography variant="body2">
                    You can add contacts to your appeal based on their status
                    and/or tags. You can also add additional contacts
                    individually at a later time.
                  </Typography>
                </Box>
                <Box mt={1} mb={1}>
                  <Typography variant="h6" display="inline">
                    Add contacts with the following status(es):
                  </Typography>
                  <Typography
                    variant="h6"
                    display="inline"
                    className={classes.selectAll}
                  >
                    select all
                  </Typography>
                  <TextField
                    variant="outlined"
                    placeholder="Select Some Options"
                    className={classes.input}
                    inputProps={{
                      style: {
                        padding: 10,
                      },
                    }}
                  />
                </Box>
                <Box mt={1} mb={1}>
                  <Typography variant="h6" display="inline">
                    Add contacts with the following tag(s):
                  </Typography>
                  <Typography
                    variant="h6"
                    display="inline"
                    className={classes.selectAll}
                  >
                    select all
                  </Typography>
                  <TextField
                    variant="outlined"
                    placeholder="Select Some Options"
                    className={classes.input}
                    inputProps={{
                      style: {
                        padding: 10,
                      },
                    }}
                  />
                </Box>
                <Box mt={1} mb={1}>
                  <Typography variant="h6">Do not add contacts who:</Typography>
                  <TextField
                    variant="outlined"
                    placeholder="Select Some Options"
                    className={classes.input}
                    inputProps={{
                      style: {
                        padding: 10,
                      },
                    }}
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
