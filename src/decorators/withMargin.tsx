import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';

const withMargin = (StoryFn: () => ReactElement): ReactElement => (
    <Box m={2}>
        <StoryFn />
    </Box>
);

export default withMargin;
