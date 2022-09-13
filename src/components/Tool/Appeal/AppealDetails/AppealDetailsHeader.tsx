/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonGroup, TextField, Box, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import NextLink from 'next/link';
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import List from '@mui/icons-material/List';
import TableChart from '@mui/icons-material/TableChart';
import clsx from 'clsx';
import { useAccountListId } from '../../../../../src/hooks/useAccountListId';
import theme from '../../../../theme';
import AppealProgressBar from '../AppealProgressBar';
import { useAppealContext } from '../AppealContextProvider/AppealContextProvider';
import { TestAppeal } from '../../../../../pages/accountLists/[accountListId]/tools/appeals/testAppeal';

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
    backgroundColor: theme.palette.cruGrayLight.main,
  },
  resize: {
    fontSize: 24,
  },
  selectedButton: {
    backgroundColor: theme.palette.cruGrayLight.main,
    boxShadow: '0 0 1px lightgray',
  },
}));

export interface Props {
  appeal: TestAppeal;
}

const AppealDetailsHeader = ({ appeal }: Props): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();
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
              {t('Appeals')}
            </Button>
          </NextLink>
        </Box>
        <Box marginRight={2}>
          {' '}
          <ButtonGroup>
            <Button
              className={
                appealState.display === 'default' ? classes.selectedButton : ''
              }
              disabled={appealState.display === 'default'}
              onClick={() =>
                setAppealState({
                  ...appealState,
                  display: 'default',
                })
              }
            >
              <List />
            </Button>
            <Button
              className={
                appealState.display === 'flow' ? classes.selectedButton : ''
              }
              disabled={appealState.display === 'flow'}
              onClick={() =>
                setAppealState({
                  ...appealState,
                  display: 'flow',
                })
              }
            >
              <TableChart />
            </Button>
          </ButtonGroup>
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
                defaultValue={appeal.name}
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
                defaultValue={appeal.goal.toFixed(2)}
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
                given={appeal.givenTotal}
                received={appeal.receivedTotal}
                commited={appeal.committedTotal}
                amount={appeal.goal}
                amountCurrency={appeal.currency}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AppealDetailsHeader;
