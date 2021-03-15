import React, { ReactElement } from 'react';
import { AppBar, Box } from '@material-ui/core';
import withDispatch from '../../../../../../decorators/withDispatch';
import SearchMenu from './SearchMenu';

export default {
  title: 'Layouts/Primary/TopBar/Items/SearchMenu',
  decorators: [
    withDispatch({ type: 'updateBreadcrumb', breadcrumb: 'Dashboard' }),
  ],
};

export const Default = (): ReactElement => {
  return (
    <>
      <AppBar>
        <Box>
          <SearchMenu />
        </Box>
      </AppBar>
    </>
  );
};
