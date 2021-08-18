import React, { ReactElement } from 'react';
import { AppBar, Box } from '@material-ui/core';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import NavMenu from './NavMenu';

export default {
  title: 'Layouts/Primary/TopBar/Items/NavMenu',
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
    <TestWrapper>
      <AppBar>
        <Box>
          <NavMenu />
        </Box>
      </AppBar>
    </TestWrapper>
  );
};
