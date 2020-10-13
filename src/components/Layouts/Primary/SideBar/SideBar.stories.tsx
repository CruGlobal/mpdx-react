import React, { ReactElement } from 'react';
import { Box, Container } from '@material-ui/core';
import { SIDE_BAR_WIDTH, SIDE_BAR_MINIMIZED_WIDTH } from './SideBar';
import SideBar from '.';

export default {
    title: 'Layouts/Primary/SideBar',
};

const Content = (): ReactElement => (
    <Container>
        <Box my={2}>
            {[...new Array(50)]
                .map(
                    () => `Cras mattis consectetur purus sit amet fermentum.
Cras justo odio, dapibus ac facilisis in, egestas eget quam.
Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
Praesent commodo cursus magna, vel scelerisque nisl consectetur et.`,
                )
                .join('\n')}
        </Box>
    </Container>
);

export const Default = (): ReactElement => {
    return (
        <>
            <SideBar open={false} handleOpenChange={(): void => {}} />
            <Box style={{ marginLeft: SIDE_BAR_MINIMIZED_WIDTH }}>
                <Content />
            </Box>
        </>
    );
};

export const Open = (): ReactElement => {
    return (
        <>
            <SideBar open={true} handleOpenChange={(): void => {}} />
            <Box style={{ marginLeft: SIDE_BAR_WIDTH }}>
                <Content />
            </Box>
        </>
    );
};
