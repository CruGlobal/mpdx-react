import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { Container, Box } from '@material-ui/core';
import withDispatch from '../../../decorators/withDispatch';
import { getNotificationsMocks } from './TopBar/NotificationMenu/NotificationMenu.mock';
import { getSideBarMock } from './SideBar/SideBar.mock';
import { getTopBarMock } from './TopBar/TopBar.mock';
import Primary from '.';

export default {
  title: 'Layouts/Primary',
  decorators: [
    withDispatch(
      { type: 'updateAccountListId', accountListId: '1' },
      { type: 'updateBreadcrumb', breadcrumb: 'Dashboard' },
    ),
  ],
};

export const Default = (): ReactElement => {
  const mocks = [...getNotificationsMocks(), getTopBarMock(), getSideBarMock()];

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
