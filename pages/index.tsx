import React, { ReactElement } from 'react';
import { signin, getSession } from 'next-auth/client';
import { Button } from '@material-ui/core';
import { useRouter } from 'next/router';
import SubjectIcon from '@material-ui/icons/Subject';
import Welcome from '../src/components/Welcome';

interface Props {
    session?: {};
}

const Index = ({ session }: Props): ReactElement => {
    const router = useRouter();

    if (typeof window !== 'undefined' && session) {
        router.push('/accountLists');
        return <></>;
    }

    return (
        <Welcome
            title="Welcome to MPDX"
            subtitle="MPDX is fundraising software from Cru that helps you grow and maintain your ministry
partners in a quick and easy way."
        >
            <Button
                size="large"
                variant="contained"
                onClick={(): void => signin('thekey', { callbackUrl: `${process.env.VERCEL_URL}/accountLists` })}
            >
                Sign In
            </Button>
            <Button
                size="large"
                startIcon={<SubjectIcon />}
                href="https://help.mpdx.org"
                target="_blank"
                rel="noopener noreferrer"
            >
                Find help
            </Button>
        </Welcome>
    );
};

Index.getInitialProps = async (context): Promise<Props> => {
    const session = await getSession(context);
    if (context.res && session) {
        context.res.writeHead(302, { Location: '/accountLists' });
        context.res.end();
    }
    return { session };
};

export default Index;
