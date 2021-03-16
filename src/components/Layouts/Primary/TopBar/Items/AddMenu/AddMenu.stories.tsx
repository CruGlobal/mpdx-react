import React, { ReactElement } from 'react';
import { AppBar, Box } from '@material-ui/core';
import withDispatch from '../../../../../../decorators/withDispatch';
import AddMenu from './AddMenu';

export default {
  title: 'Layouts/Primary/TopBar/Items/AddMenu',
  decorators: [
    withDispatch({ type: 'updateBreadcrumb', breadcrumb: 'Dashboard' }),
  ],
};

export const Default = (): ReactElement => {
  return (
    <>
      <AppBar>
        <Box>
          <AddMenu />
        </Box>
      </AppBar>
    </>
  );
};
