import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, makeStyles, Theme } from '@material-ui/core';
import PageHeading from '../../PageHeading';
import TaskList from '../List';
import { TaskFilter } from '../List/List';

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        paddingTop: 40,
    },
    tabpanel: {
        padding: theme.spacing(3, 0, 0),
    },
}));

export type SelectedTab = 'list';

interface Props {
    tab?: SelectedTab;
    initialFilter?: TaskFilter;
}

const TaskHome = ({ initialFilter }: Props): ReactElement => {
    const { t } = useTranslation();
    const classes = useStyles();
    return (
        <>
            <PageHeading
                heading={t('Tasks')}
                imgSrc={require('../../../images/drawkit/grape/drawkit-grape-pack-illustration-8.svg')}
            />
            <Container className={classes.container}>
                <TaskList initialFilter={initialFilter} />
            </Container>
        </>
    );
};

export default TaskHome;
