import { Box, Button, Typography } from '@mui/material';
import React, { ReactElement } from 'react';
import { MoreActionHideContactModal } from './MoreActionHideContactModal';

export default {
  title: 'Contacts/ContactDetails/Header/HideContactModal',
  component: MoreActionHideContactModal,
};

export const Default = (): ReactElement => {
  return (
    <Box>
      <MoreActionHideContactModal
        open={true}
        setOpen={() => {}}
        hiding={false}
        hideContact={() => {}}
      />
    </Box>
  );
};

export const Loading = (): ReactElement => {
  return (
    <Box>
      <MoreActionHideContactModal
        open={true}
        setOpen={() => {}}
        hiding={true}
        hideContact={() => {}}
      />
    </Box>
  );
};

export const Functional = (): ReactElement => {
  const [open, setOpen] = React.useState(false);
  return (
    <Box>
      <Button type="button" variant="text" onClick={() => setOpen(true)}>
        <Typography>Open</Typography>
      </Button>
      <MoreActionHideContactModal
        open={open}
        setOpen={setOpen}
        hiding={false}
        hideContact={() => {
          setOpen(false);
        }}
      />
    </Box>
  );
};
