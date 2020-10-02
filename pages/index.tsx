import React, { ReactElement } from 'react';
import { getSession } from 'next-auth/client';
import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import BaseLayout from '../src/components/Layouts/Basic';

const IndexPage = (): ReactElement => <></>;

IndexPage.layout = BaseLayout;

export const getServerSideProps: GetServerSideProps = async (context): Promise<GetServerSidePropsResult<unknown>> => {
    const session = await getSession(context);

    if (session) {
        context.res.writeHead(302, { Location: '/accountLists' });
        context.res.end();
    } else {
        context.res.writeHead(302, { Location: '/login' });
        context.res.end();
    }
    return { props: {} };
};

export default IndexPage;
