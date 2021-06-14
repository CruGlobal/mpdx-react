import React from 'react';
import { render } from '@testing-library/react';
import { MuiThemeProvider } from '@material-ui/core';
import userEvent from '@testing-library/user-event';
import theme from '../../../theme';
import Modal from './Modal';

const modalTitle = 'modal title';
const modalTextContent = 'modal text content';
const handleClose = jest.fn();
const handleConfirm = jest.fn();

it('renders when isOpen is true', () => {
  const { getByText } = render(
    <MuiThemeProvider theme={theme}>
      <Modal
        isOpen={true}
        title={modalTitle}
        content={<>{modalTextContent}</>}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    </MuiThemeProvider>,
  );
  expect(getByText(modalTitle)).toBeInTheDocument();
  expect(getByText(modalTextContent)).toBeInTheDocument();
});

it('does not render when isOpen is false', () => {
  const { queryByText } = render(
    <MuiThemeProvider theme={theme}>
      <Modal
        isOpen={false}
        title={modalTitle}
        content={<>{modalTextContent}</>}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    </MuiThemeProvider>,
  );
  expect(queryByText(modalTitle)).not.toBeInTheDocument();
  expect(queryByText(modalTextContent)).not.toBeInTheDocument();
});

it('renders customActionSection', () => {
  const customActionSectionText = 'custom action section text';
  const { getByText } = render(
    <MuiThemeProvider theme={theme}>
      <Modal
        isOpen={true}
        title={modalTitle}
        content={<>{modalTextContent}</>}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        customActionSection={<>{customActionSectionText}</>}
      />
    </MuiThemeProvider>,
  );
  expect(getByText(customActionSectionText)).toBeInTheDocument();
});

it('renders custom cancelText', () => {
  const customCancelText = 'custom cancel text';
  const { getByText } = render(
    <MuiThemeProvider theme={theme}>
      <Modal
        isOpen={true}
        title={modalTitle}
        content={<>{modalTextContent}</>}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        cancelText={customCancelText}
      />
    </MuiThemeProvider>,
  );
  expect(getByText(customCancelText)).toBeInTheDocument();
});

it('renders custom confirmText', () => {
  const customConfirmText = 'custom confirm text';
  const { getByText } = render(
    <MuiThemeProvider theme={theme}>
      <Modal
        isOpen={true}
        title={modalTitle}
        content={<>{modalTextContent}</>}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        confirmText={customConfirmText}
      />
    </MuiThemeProvider>,
  );
  expect(getByText(customConfirmText)).toBeInTheDocument();
});

it('fires onClose | Close Button', () => {
  const { getByRole } = render(
    <MuiThemeProvider theme={theme}>
      <Modal
        isOpen={true}
        title={modalTitle}
        content={<>{modalTextContent}</>}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    </MuiThemeProvider>,
  );
  userEvent.click(getByRole('button', { name: 'Close' }));
  expect(handleClose).toHaveBeenCalled();
});

it('fires onClose | Cancel Button', () => {
  const { getByRole } = render(
    <MuiThemeProvider theme={theme}>
      <Modal
        isOpen={true}
        title={modalTitle}
        content={<>{modalTextContent}</>}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    </MuiThemeProvider>,
  );
  userEvent.click(getByRole('button', { name: 'Cancel' }));
  expect(handleClose).toHaveBeenCalled();
});

it('fires onConfirm', () => {
  const { getByRole } = render(
    <MuiThemeProvider theme={theme}>
      <Modal
        isOpen={true}
        title={modalTitle}
        content={<>{modalTextContent}</>}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    </MuiThemeProvider>,
  );
  userEvent.click(getByRole('button', { name: 'Save' }));
  expect(handleConfirm).toHaveBeenCalled();
});

it('does not fire onClose or onConfirm if action buttons are disabled', () => {
  const { getByRole } = render(
    <MuiThemeProvider theme={theme}>
      <Modal
        isOpen={true}
        title={modalTitle}
        content={<>{modalTextContent}</>}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        disableActionButtons={true}
      />
    </MuiThemeProvider>,
  );
  userEvent.click(getByRole('button', { name: 'Cancel' }));
  userEvent.click(getByRole('button', { name: 'Save' }));
  expect(handleConfirm).not.toHaveBeenCalled();
  expect(handleClose).not.toHaveBeenCalled();
});
