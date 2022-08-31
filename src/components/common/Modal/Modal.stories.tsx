import React, { useState } from 'react';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  MuiThemeProvider,
} from '@mui/material';
import { Story } from '@storybook/react';
import theme from '../../../theme';
import Modal from './Modal';

export default {
  title: 'Modal',
  component: Modal,
  args: {
    size: 'sm',
    fullWidth: true,
    title: 'Default Title',
  },
  argTypes: {
    size: {
      name: 'size',
      options: {
        'Extra Small': 'xs',
        Small: 'sm',
        Medium: 'md',
        Large: 'lg',
        'Extra Large': 'xl',
      },
      control: { type: 'select' },
    },
    handleClose: { name: 'handleClose', action: 'handleClose fired' },
    handleConfirm: {
      name: 'handleConfirm',
      action: 'handleConfirm fired',
    },
    handleThirdButton: {
      name: 'handleThirdButton',
      action: 'handleThirdButton fired',
    },
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
        open modal
      </Button>
      <MuiThemeProvider theme={theme}>
        <Modal
          size={args.size}
          isOpen={modalOpen}
          handleClose={() => {
            changeModalOpen(false);
            args.handleClose();
          }}
          fullWidth={args.fullWidth}
          title={args.title}
        >
          <DialogContent dividers>
            <p>Some random content</p>
          </DialogContent>
          <DialogActions>
            <Button
              variant="text"
              color="default"
              onClick={() => {
                changeModalOpen(false);
                args.handleClose();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                changeModalOpen(false);
                args.handleConfirm();
              }}
            >
              Confirm
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                changeModalOpen(false);
                args.handleThirdButton();
              }}
            >
              Third Button
            </Button>
          </DialogActions>
        </Modal>
      </MuiThemeProvider>
    </Box>
  );
};
