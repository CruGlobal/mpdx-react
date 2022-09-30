import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Theme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import PageHeading from '../../PageHeading';
import TaskList from '../List';
import { TaskFilter } from '../List/List';
import illustration8 from '../../../images/drawkit/grape/drawkit-grape-pack-illustration-8.svg';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    paddingTop: 40,
  },
  tabpanel: {
    padding: theme.spacing(3, 0, 0),
  },
}));

interface Props {
  initialFilter?: TaskFilter;
}

const TaskHome = ({ initialFilter }: Props): ReactElement => {
  const { t } = useTranslation();
  const { classes } = useStyles();
  return (
    <>
      <PageHeading heading={t('Tasks')} imgSrc={illustration8} />
      <Container className={classes.container}>
        <TaskList initialFilter={initialFilter} />
      </Container>
    </>
  );
};

export default TaskHome;
