import React, { ReactElement, useEffect } from 'react';
import Axios from 'axios';
import { useRouter } from 'next/router';
import useUser from '../src/lib/useUser';

const IndexPage = (): ReactElement => {
    useUser({ redirectTo: '/', redirectIfFound: true });
    const router = useRouter();
    useEffect(() => {
        const logout = async (): Promise<void> => {
            await Axios.post('/api/logout');
            localStorage.removeItem('token');
            router.push('/login');
        };
        logout();
    }, []);

    return <></>;
};

export default IndexPage;
