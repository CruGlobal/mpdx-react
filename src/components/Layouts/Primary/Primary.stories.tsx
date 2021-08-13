import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { Container, Box } from '@material-ui/core';
import { getNotificationsMocks } from './TopBar/Items/NotificationMenu/NotificationMenu.mock';
import { getTopBarMock } from './TopBar/TopBar.mock';
import Primary from '.';

export default {
  title: 'Layouts/Primary',
};

export const Default = (): ReactElement => {
  const mocks = [...getNotificationsMocks(), getTopBarMock()];

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <Primary>
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
      </Primary>
    </MockedProvider>
  );
};
