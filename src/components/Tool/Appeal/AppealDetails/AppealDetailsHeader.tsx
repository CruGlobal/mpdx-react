/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactElement } from 'react';
import {
  Button,
  ButtonGroup,
  TextField,
  makeStyles,
  Box,
  Grid,
} from '@material-ui/core';
import NextLink from 'next/link';
import { ArrowBackIos, List, TableChart } from '@material-ui/icons';
import clsx from 'clsx';
import { useAccountListId } from '../../../../../src/hooks/useAccountListId';
import theme from '../../../../theme';
import AppealProgressBar from '../AppealProgressBar';
import { useAppealContext } from '../AppealContextProvider/AppealContextProvider';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
  },
  row: {
    paddingBottom: theme.spacing(3),
  },
  secondRow: {
    paddingTop: theme.spacing(3),
    border: '1px solid',
    borderColor: theme.palette.cruGrayMedium.main,
    borderRadius: 10,
    backgroundColor: 'rgba(82, 168, 236, 0.1)',
  },
  resize: {
    fontSize: 24,
  },
}));

const AppealDetailsHeader = (): ReactElement => {
  const classes = useStyles();
  const accountListId = useAccountListId();
  const { appealState, setAppealState } = useAppealContext();

  return (
    <Box className={classes.container}>
      <Box display="flex" alignItems="center" className={classes.row}>
        <Box marginRight={2}>
          <NextLink
            href={`/accountLists/${accountListId}/tools/appeals`}
            scroll={false}
          >
            <Button variant="outlined">
              <ArrowBackIos fontSize="small" />
              Appeals
            </Button>
          </NextLink>
        </Box>
        <Box marginRight={2}>
          {' '}
          <ButtonGroup>
            <Button onClick={() => console.log(appealState)}>
              <List />
            </Button>
            <Button
              onClick={() =>
                setAppealState({
                  display: 'flow',
                  selected: appealState.selected,
                })
              }
            >
              <TableChart />
            </Button>
          </ButtonGroup>
        </Box>
        <Box>
          <Button
            variant="outlined"
            onClick={() =>
              setAppealState({
                display: appealState.display,
                selected: [...appealState.selected, 'aaa'],
              })
            }
          >
            Select All
          </Button>
        </Box>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        className={clsx(classes.row, classes.secondRow)}
      >
        <Grid container>
          <Grid item xs={12} md={6}>
            <Box ml={2} mr={2}>
              <TextField
                label="Name"
                defaultValue="Test Appeal 123"
                style={{ width: '100%' }}
                InputProps={{
                  classes: {
                    input: classes.resize,
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box ml={2} mr={2}>
              <TextField
                label="Goal"
                defaultValue="4613.18"
                style={{ width: '100%' }}
                InputProps={{
                  classes: {
                    input: classes.resize,
                  },
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box ml={2} mr={2}>
              <AppealProgressBar
                given={0}
                received={500}
                commited={0}
                amount={4613.18}
                amountCurrency={'CAD'}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AppealDetailsHeader;
