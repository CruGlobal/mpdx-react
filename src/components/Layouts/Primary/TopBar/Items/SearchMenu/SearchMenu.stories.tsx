import React, { ReactElement } from 'react';
import { AppBar, Box } from '@mui/material';
import SearchMenu from './SearchMenu';

export default {
  title: 'Layouts/Primary/TopBar/Items/SearchMenu',
};

export const Default = (): ReactElement => {
  return (
    <AppBar>
      <Box>
        <SearchMenu />
      </Box>
    </AppBar>
  );
};
