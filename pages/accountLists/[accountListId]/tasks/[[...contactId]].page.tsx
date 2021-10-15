import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Hidden,
  Link,
  styled,
} from '@material-ui/core';
import { ListHeader } from '../../../../src/components/Shared/Header/ListHeader';
import { InfiniteList } from '../../../../src/components/InfiniteList/InfiniteList';
import { ContactDetails } from '../../../../src/components/Contacts/ContactDetails/ContactDetails';
import Loading from '../../../../src/components/Loading';
import { SidePanelsLayout } from '../../../../src/components/Layouts/SidePanelsLayout';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import { TaskFilterSetInput } from '../../../../graphql/types.generated';
import useTaskDrawer from '../../../../src/hooks/useTaskDrawer';
import { useTasksQuery } from './Tasks.generated';

const WhiteBackground = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { query, push, replace, isReady, pathname } = useRouter();

  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const [contactDetailsId, setContactDetailsId] = useState<string>();

  const { contactId, searchTerm } = query;

  const { openTaskDrawer } = useTaskDrawer();

  if (contactId !== undefined && !Array.isArray(contactId)) {
    throw new Error('contactId should be an array or undefined');
  }

  if (searchTerm !== undefined && !Array.isArray(searchTerm)) {
    throw new Error('searchTerm should be an array or undefined');
  }

  useEffect(() => {
    if (isReady && contactId) {
      setContactDetailsId(contactId[0]);
      setContactDetailsOpen(true);
    }
  }, [isReady, contactId]);

  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeFilters, setActiveFilters] = useState<TaskFilterSetInput>({});

  const { data, loading, fetchMore } = useTasksQuery({
    variables: {
      accountListId: accountListId ?? '',
      tasksFilter: { ...activeFilters, wildcardSearch: searchTerm?.[0] },
    },
    skip: !accountListId,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleFilterPanel = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  const setContactFocus = (id?: string) => {
    const { contactId: _, ...queryWithoutContactId } = query;
    push(
      id
        ? {
            pathname: '/accountLists/[accountListId]/tasks/[contactId]',
            query: { ...queryWithoutContactId, contactId: id },
          }
        : {
            pathname: '/accountLists/[accountListId]/tasks/',
            query: queryWithoutContactId,
          },
    );
    id && setContactDetailsId(id);
    setContactDetailsOpen(!!id);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setSearchTerm = (searchTerm?: string) => {
    const { searchTerm: _, ...oldQuery } = query;
    replace({
      pathname,
      query: {
        ...oldQuery,
        ...(searchTerm && { searchTerm }),
      },
    });
  };

  return (
    <>
      <Head>
        <title>MPDX | {t('Tasks')}</title>
      </Head>
      {accountListId ? (
        <WhiteBackground>
          <SidePanelsLayout
            leftPanel={<>TODO: implement task filters</>}
            leftOpen={filterPanelOpen}
            leftWidth="290px"
            mainContent={
              <>
                <ListHeader
                  activeFilters={Object.keys(activeFilters).length > 0}
                  filterPanelOpen={filterPanelOpen}
                  toggleFilterPanel={toggleFilterPanel}
                  onSearchTermChanged={setSearchTerm}
                  totalCount={data?.tasks.totalCount}
                  buttonGroup={
                    <Hidden xsDown>
                      <ButtonGroup variant="contained">
                        <Button onClick={() => openTaskDrawer({})}>
                          Add Task
                        </Button>
                        <Button>Log Task</Button>
                      </ButtonGroup>
                    </Hidden>
                  }
                />
                <InfiniteList
                  loading={loading}
                  data={data?.tasks.nodes}
                  totalCount={data?.tasks.totalCount}
                  style={{ height: 'calc(100vh - 160px)' }}
                  itemContent={(index, task) => (
                    <Box key={index} flexDirection="row">
                      <Box>
                        {task.contacts.nodes.map((contact) => (
                          <Link
                            key={contact.id}
                            onClick={() => setContactFocus(contact.id)}
                          >
                            {contact.name}
                          </Link>
                        ))}
                      </Box>
                      {task.subject}
                    </Box>
                  )}
                  endReached={() =>
                    data?.tasks.pageInfo.hasNextPage &&
                    fetchMore({
                      variables: { after: data.tasks.pageInfo.endCursor },
                    })
                  }
                  EmptyPlaceholder={
                    <Card>
                      <CardContent>
                        TODO: Implement Empty Placeholder
                      </CardContent>
                    </Card>
                  }
                />
              </>
            }
            rightPanel={
              contactDetailsId ? (
                <ContactDetails
                  accountListId={accountListId}
                  contactId={contactDetailsId}
                  onClose={() => setContactFocus(undefined)}
                />
              ) : (
                <></>
              )
            }
            rightOpen={contactDetailsOpen}
            rightWidth="45%"
          />
        </WhiteBackground>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default ContactsPage;
