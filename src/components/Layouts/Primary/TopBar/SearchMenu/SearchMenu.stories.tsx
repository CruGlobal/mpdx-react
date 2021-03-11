import React, { ReactElement } from 'react';
import { AppBar, Box } from '@material-ui/core';
import withDispatch from '../../../../../decorators/withDispatch';
import SearchMenu from '.';

export default {
  title: 'Layouts/Primary/TopBar/SearchMenu',
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
