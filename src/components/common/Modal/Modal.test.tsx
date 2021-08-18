import React from 'react';
import { render } from '@testing-library/react';
import { MuiThemeProvider } from '@material-ui/core';
import userEvent from '@testing-library/user-event';
import theme from '../../../theme';
import Modal from './Modal';

const modalTitle = 'modal title';
const modalTextContent = 'modal text content';
const handleClose = jest.fn();

it('renders when isOpen is true', () => {
  const { getByText } = render(
    <MuiThemeProvider theme={theme}>
      <Modal isOpen={true} title={modalTitle} handleClose={handleClose}>
        <>{modalTextContent}</>
      </Modal>
    </MuiThemeProvider>,
  );
  expect(getByText(modalTitle)).toBeInTheDocument();
  expect(getByText(modalTextContent)).toBeInTheDocument();
});

it('does not render when isOpen is false', () => {
  const { queryByText } = render(
    <MuiThemeProvider theme={theme}>
      <Modal isOpen={false} title={modalTitle} handleClose={handleClose}>
        <>{modalTextContent}</>
      </Modal>
    </MuiThemeProvider>,
  );
  expect(queryByText(modalTitle)).not.toBeInTheDocument();
  expect(queryByText(modalTextContent)).not.toBeInTheDocument();
});

it('fires onClose | Close Button', () => {
  const { getByLabelText } = render(
    <MuiThemeProvider theme={theme}>
      <Modal isOpen={true} title={modalTitle} handleClose={handleClose}>
        <>{modalTextContent}</>
      </Modal>
    </MuiThemeProvider>,
  );
  userEvent.click(getByLabelText('Close'));
  expect(handleClose).toHaveBeenCalled();
});
