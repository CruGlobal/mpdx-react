import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getSession, setOptions } from 'next-auth/client';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../../../src/components/App';
import TaskHome from '../../../../src/components/Task/Home';
import { SelectedTab } from '../../../../src/components/Task/Home/Home';

interface Props {
    accountListId: string;
    tab: SelectedTab;
}

const TasksPage = ({ accountListId, tab }: Props): ReactElement => {
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
            <TaskHome tab={tab} />
        </>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
    req,
    res,
}): Promise<{ props: Props }> => {
    setOptions({ site: process.env.SITE_URL });
    const session = await getSession({ req });

    if (!session?.user?.token) {
        res.writeHead(302, { Location: '/' });
        res.end();
        return null;
    }

    return {
        props: { accountListId: params.accountListId.toString(), tab: params.tab.toString() as SelectedTab },
    };
};

export default TasksPage;
