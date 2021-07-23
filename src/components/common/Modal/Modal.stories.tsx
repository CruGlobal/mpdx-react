import React, { useState } from 'react';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  MuiThemeProvider,
} from '@material-ui/core';
import { Story } from '@storybook/react';
import { text, select, boolean } from '@storybook/addon-knobs';
import theme from '../../../theme';
import Modal from './Modal';

export default {
  title: 'Modal',
  component: Modal,
  argTypes: {
    handleClose: { action: 'handleClose fired' },
    handleConfirm: { action: 'handleConfirm fired' },
  },
};

export const Default: Story = (args) => {
  const [modalOpen, changeModalOpen] = useState(false);
  return (
    <Box m={2}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => changeModalOpen(true)}
      >
        {'open modal'}
      </Button>
      <MuiThemeProvider theme={theme}>
        <Modal
          size={select(
            'Modal size',
            {
              'Extra Small': 'xs',
              Small: 'sm',
              Medium: 'md',
              Large: 'lg',
              'Extra Large': 'xl',
            },
            'sm',
          )}
          isOpen={modalOpen}
          handleClose={() => {
            changeModalOpen(false);
            args.handleClose();
          }}
          fullWidth={boolean('Full Width', true)}
          title={text('modal title', 'Default Title')}
        >
          <DialogContent dividers>
            <p>Some random content</p>
          </DialogContent>
          <DialogActions>
            <Button variant="text" color="default">
              Cancel
            </Button>
            <Button variant="outlined" color="primary">
              Confirm
            </Button>
            <Button variant="contained" color="secondary">
              Third Button
            </Button>
          </DialogActions>
        </Modal>
      </MuiThemeProvider>
    </Box>
  );
};
