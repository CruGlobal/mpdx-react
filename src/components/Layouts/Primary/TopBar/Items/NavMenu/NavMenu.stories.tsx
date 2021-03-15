import React, { ReactElement } from 'react';
import { AppBar, Box } from '@material-ui/core';
import withDispatch from '../../../../../../decorators/withDispatch';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import NavMenu from './NavMenu';

export default {
  title: 'Layouts/Primary/TopBar/Items/NavMenu',
  decorators: [
    withDispatch(
      { type: 'updateBreadcrumb', breadcrumb: 'Dashboard' },
      { type: 'updateAccountListId', accountListId: '1' },
    ),
  ],
};

export const Default = (): ReactElement => {
  return (
    <>
      <AppBar>
        <Box>
          <NavMenu />
        </Box>
      </AppBar>
    </>
  );
};

export const Hidden = (): ReactElement => {
  return (
    <TestWrapper initialState={null}>
      <AppBar>
        <Box>
          <NavMenu />
        </Box>
      </AppBar>
    </TestWrapper>
  );
};
