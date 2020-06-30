import React, { ReactElement, Fragment, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Axios from 'axios';
import Footer from '../src/components/Footer';
import useUser from '../src/lib/useUser';

const IndexPage = (): ReactElement => {
    useUser({ redirectTo: '/', redirectIfFound: true });
    const router = useRouter();

    useEffect(() => {
        const currentHref = window.location.href;
        const newHref = window.location.href.replace('#', '?');
        if (currentHref !== newHref) {
            window.location.href = newHref;
            return;
        }
        if (!router.query.access_token) return;
        const fetchData = async (): Promise<void> => {
            try {
                const response = await Axios.post('/api/login', { accessToken: router.query.access_token });
                localStorage.setItem('token', response.data.token);
                router.push('/');
            } catch {
                router.push('/login');
            }
        };

        fetchData();
    }, [router]);

    return (
        <Fragment>
            <Head>
                <title>MPDX | Fundraising software built for God’s people</title>
            </Head>
        </Fragment>
    );
};

export default IndexPage;
