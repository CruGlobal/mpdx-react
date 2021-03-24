import React, { ReactElement, useEffect } from 'react';
import {
  makeStyles,
  Theme,
  Box,
  Card,
  Grid,
  CardContent,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import illustration4 from '../../../../images/drawkit/grape/drawkit-grape-pack-illustration-4.svg';
import TaskDrawerContactListItem from './Item';
import { useGetContactsForTaskDrawerContactListLazyQuery } from './TaskDrawerContactList.generated';

const useStyles = makeStyles((theme: Theme) => ({
  cardContent: {
    padding: theme.spacing(2),
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    height: '120px',
    marginBottom: 0,
    [theme.breakpoints.down('xs')]: {
      height: '150px',
      marginBottom: theme.spacing(2),
    },
  },
}));

interface Props {
  accountListId: string;
  contactIds: string[];
}

const TaskDrawerContactList = ({
  accountListId,
  contactIds,
}: Props): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [
    getContacts,
    { data, loading, error },
  ] = useGetContactsForTaskDrawerContactListLazyQuery();

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [error]);

  useEffect(() => {
    if (contactIds.length > 0) {
      getContacts({
        variables: {
          accountListId,
          contactIds,
        },
      });
    }
  }, [contactIds]);

  return (
    <Box m={2}>
      {loading ? (
        <Grid
          container
          spacing={2}
          direction="column"
          data-testid="TaskDrawerContactListLoading"
        >
          <Grid item>
            <TaskDrawerContactListItem />
          </Grid>
          <Grid item>
            <TaskDrawerContactListItem />
          </Grid>
        </Grid>
      ) : (
        <>
          {(contactIds.length === 0 || data?.contacts?.nodes?.length === 0) && (
            <Card data-testid="TaskDrawerContactListEmpty">
              <CardContent className={classes.cardContent}>
                <img src={illustration4} className={classes.img} alt="empty" />
                {t('No Contacts to show.')}
              </CardContent>
            </Card>
          )}
          {data?.contacts?.nodes && data.contacts.nodes.length > 0 && (
            <Grid container spacing={2} direction="column">
              {[...data.contacts.nodes]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((contact) => (
                  <Grid
                    item
                    key={contact.id}
                    data-testid={`TaskDrawerContactListItem-${contact.id}`}
                  >
                    <TaskDrawerContactListItem contact={contact} />
                  </Grid>
                ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default TaskDrawerContactList;
