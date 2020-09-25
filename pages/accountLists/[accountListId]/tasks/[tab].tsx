import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import { getSession, setOptions } from 'next-auth/client';
import { useTranslation } from 'react-i18next';
import { castArray, pick } from 'lodash/fp';
import { parse } from 'query-string';
import { useApp } from '../../../../src/components/App';
import TaskHome from '../../../../src/components/Task/Home';
import { SelectedTab } from '../../../../src/components/Task/Home/Home';
import { TaskFilter } from '../../../../src/components/Task/List/List';
import reduceObject from '../../../../src/lib/reduceObject';

interface Props {
    accountListId: string;
    tab: SelectedTab;
    initialFilter: TaskFilter;
}

const TasksPage = ({ accountListId, tab, initialFilter }: Props): ReactElement => {
    console.log('initialFilter', initialFilter);
    const { dispatch } = useApp();
    const { t } = useTranslation();

    useEffect(() => {
        dispatch({ type: 'updateBreadcrumb', breadcrumb: t('Tasks') });
        dispatch({ type: 'updateAccountListId', accountListId });
    }, []);

    return (
        <>
            <Head>
                <title>MPDX | {t('Tasks')}</title>
            </Head>
            <TaskHome tab={tab} initialFilter={initialFilter} />
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({
    params,
    req,
    res,
}): Promise<GetServerSidePropsResult<Props | unknown>> => {
    setOptions({ site: process.env.SITE_URL });
    const session = await getSession({ req });

    if (!session?.user?.token) {
        res.writeHead(302, { Location: '/' });
        res.end();
        return { props: {} };
    }

    let initialFilter = {};
    const queryString = req.url.split('?')[1];

    if (queryString) {
        const filter = parse(queryString);

        initialFilter = reduceObject(
            (result: TaskFilter, value: string | string[], key: string) => {
                switch (key) {
                    case 'completed':
                        result.completed = value === 'true';
                        break;
                    case 'wildcardSearch':
                        result.wildcardSearch = value.toString();
                        break;
                    default:
                        result[key] = castArray(value);
                }
                return result;
            },
            {},
            filter,
        );

        initialFilter = pick(
            ['userIds', 'tags', 'contactIds', 'activityType', 'completed', 'wildcardSearch'],
            initialFilter,
        );
    }

    return {
        props: {
            accountListId: params.accountListId.toString(),
            tab: params.tab.toString() as SelectedTab,
            initialFilter,
        },
    };
};

export default TasksPage;
