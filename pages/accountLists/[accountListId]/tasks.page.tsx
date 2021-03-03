import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/client';
import { useTranslation } from 'react-i18next';
import { parse } from 'query-string';
import { useRouter } from 'next/router';
import { useApp } from '../../../src/components/App';
import TaskHome from '../../../src/components/Task/Home';
import { TaskFilter } from '../../../src/components/Task/List/List';

export const initialFilterFromPath = (path: string): TaskFilter => {
  let initialFilter: TaskFilter = {};
  const queryString = path.split('?')[1];

  if (queryString) {
    const filter = parse(queryString);

    initialFilter = Object.entries(filter).reduce(
      (result: TaskFilter, [key, value]) => {
        switch (key) {
          case 'completed':
            result.completed = value === 'true';
            break;
          case 'wildcardSearch':
            result.wildcardSearch = value.toString();
            break;
          case 'startAt[max]':
            if (!result.startAt) result.startAt = {};
            result.startAt.max = value.toString();
            break;
          case 'startAt[min]':
            if (!result.startAt) result.startAt = {};
            result.startAt.min = value.toString();
            break;
          default:
            result[key.replace('[]', '')] = Array.isArray(value)
              ? value
              : [value];
        }
        return result;
      },
      {},
    );

    const {
      userIds,
      tags,
      contactIds,
      activityType,
      completed,
      wildcardSearch,
      startAt,
    } = initialFilter;

    return {
      userIds,
      tags,
      contactIds,
      activityType,
      completed,
      wildcardSearch,
      startAt,
    };
  }
};

const TasksPage = (): ReactElement => {
  const { dispatch } = useApp();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    dispatch({ type: 'updateBreadcrumb', breadcrumb: t('Tasks') });
    dispatch({
      type: 'updateAccountListId',
      accountListId: router.query.accountListId.toString(),
    });
  }, []);

  const initialFilter = initialFilterFromPath(router.asPath);

  return (
    <>
      <Head>
        <title>MPDX | {t('Tasks')}</title>
      </Head>
      <TaskHome initialFilter={initialFilter} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });

  if (!session?.user['token']) {
    res.writeHead(302, { Location: '/' });
    res.end();
    return { props: {} };
  }

  return {
    props: {},
  };
};

export default TasksPage;
