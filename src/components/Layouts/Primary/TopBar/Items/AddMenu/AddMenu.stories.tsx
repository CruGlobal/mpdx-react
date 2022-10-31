import React, { ReactElement } from 'react';
import { AppBar, Box } from '@mui/material';
import AddMenu from './AddMenu';

export default {
  title: 'Layouts/Primary/TopBar/Items/AddMenu',
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
