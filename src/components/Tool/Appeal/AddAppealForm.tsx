import {
  Box,
  CardContent,
  CardHeader,
  Typography,
  FormControl,
  TextField,
  makeStyles,
  Button,
  Grid,
  Theme,
} from '@material-ui/core';
import React, { ReactElement } from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiClose, mdiEqual } from '@mdi/js';
import theme from '../../../../src/theme';
import AnimatedCard from '../../../../src/components/AnimatedCard';

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

const AddAppealForm = (): ReactElement => {
  const classes = useStyles();

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
          <FormControl className={classes.form}>
            <Box mb={1}>
              <Typography variant="h6">Name</Typography>
              <TextField
                variant="outlined"
                className={classes.input}
                inputProps={{
                  style: {
                    padding: 10,
                  },
                }}
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
                    <Typography variant="h6">Initial Goal</Typography>
                    <TextField
                      variant="outlined"
                      className={classes.input}
                      inputProps={{
                        style: {
                          padding: 10,
                        },
                      }}
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
                    <Typography variant="h6">Letter Cost</Typography>
                    <TextField
                      variant="outlined"
                      className={classes.input}
                      inputProps={{
                        style: {
                          padding: 10,
                        },
                      }}
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
                    <Typography variant="h6">Admin %</Typography>
                    <TextField
                      variant="outlined"
                      className={classes.input}
                      inputProps={{
                        style: {
                          padding: 10,
                        },
                      }}
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
                    <Typography variant="h6">Goal</Typography>
                    <TextField
                      variant="outlined"
                      className={classes.input}
                      inputProps={{
                        style: {
                          padding: 10,
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <Box mt={2} mb={1} className={classes.blueBox}>
              <Typography variant="body2">
                You can add contacts to your appeal based on their status and/or
                tags. You can also add additional contacts individually at a
                later time.
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
              >
                Add Appeal
              </Button>
            </Box>
          </FormControl>
        </CardContent>
      </AnimatedCard>
    </Box>
  );
};

export default AddAppealForm;
