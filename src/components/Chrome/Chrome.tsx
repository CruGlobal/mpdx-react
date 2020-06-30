import React, { ReactElement, ReactNode } from 'react';
import TopBar from '../TopBar';
import Footer from '../Footer';

interface Props {
    children: ReactNode;
}

const Chrome = ({ children }: Props): ReactElement => {
    return (
        <>
            <TopBar />
            {children}
            <Footer />
        </>
    );
};

export default Chrome;
