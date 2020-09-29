import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getSession, setOptions } from 'next-auth/client';
import { useTranslation } from 'react-i18next';
import ContactShow from '../../../../src/components/Contact/Show';
import { useApp } from '../../../../src/components/App';

interface Props {
    accountListId: string;
    contactId: string;
}

const ContactIdPage = ({ accountListId, contactId }: Props): ReactElement => {
    const { dispatch } = useApp();
    const { t } = useTranslation();

    useEffect(() => {
        dispatch({ type: 'updateAccountListId', accountListId });
        dispatch({ type: 'updateBreadcrumb', breadcrumb: 'Contact' });
    }, []);

    return (
        <>
            <Head>
                <title>MPDX | {t('Contacts')}</title>
            </Head>
            <ContactShow contactId={contactId} />
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
        props: {
            accountListId: params.accountListId.toString(),
            contactId: params.contactId.toString(),
        },
    };
};

export default ContactIdPage;
