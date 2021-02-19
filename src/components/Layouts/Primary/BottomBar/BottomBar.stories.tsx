import React, { ReactElement } from 'react';
import { Box, Container } from '@material-ui/core';
import BottomBar from '.';

export default {
  title: 'Layouts/Primary/BottomBar',
};

const Content = (): ReactElement => (
  <Box>
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
  </Box>
);

export const Default = (): ReactElement => {
  return (
    <>
      <Content />
      <BottomBar />
    </>
  );
};
