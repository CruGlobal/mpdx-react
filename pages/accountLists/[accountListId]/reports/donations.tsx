import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import { getSession, setOptions } from 'next-auth/client';
import { useTranslation } from 'react-i18next';
import { castArray, pick } from 'lodash/fp';
import { parse } from 'query-string';
import { useApp } from '../../../../src/components/App';
import { TaskFilter } from '../../../../src/components/Task/List/List';
import reduceObject from '../../../../src/lib/reduceObject';
import ReportsDonations from '../../../../src/components/Reports/Donations';

interface Props {
    accountListId: string;
    initialFilter: TaskFilter;
}

const DonationsPage = ({ accountListId, initialFilter }: Props): ReactElement => {
    const { dispatch } = useApp();
    const { t } = useTranslation();

    useEffect(() => {
        dispatch({ type: 'updateBreadcrumb', breadcrumb: t('Reports - Donations') });
        dispatch({ type: 'updateAccountListId', accountListId });
    }, []);

    return (
        <>
            <Head>
                <title>MPDX | {t('Donations')}</title>
            </Head>
            <ReportsDonations initialFilter={initialFilter} />
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

        initialFilter = pick(['designationAccountIds', 'donorAccountIds', 'contactIds', 'donationDate'], initialFilter);
    }

    return {
        props: {
            accountListId: params.accountListId.toString(),
            initialFilter,
        },
    };
};

export default DonationsPage;
