import { ThemeProvider } from '@material-ui/core';
import React from 'react';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import theme from '../../../theme';
import DeleteModal from './DeleteModal';

const testState = {
  open: true,
  contactIndex: 0,
  numberIndex: 0,
  phoneNumber: '623533895895',
};

describe('FixPhoneNumbers-DeleteModal', () => {
  it('default', () => {
    const handleClose = jest.fn();
    const handleDelete = jest.fn();

    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <DeleteModal
            modalState={testState}
            handleClose={handleClose}
            handleDelete={handleDelete}
          />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(getByText('Confirm')).toBeInTheDocument();
    expect(
      getByText('Are you sure you wish to delete this phone number:'),
    ).toBeInTheDocument();
    expect(getByText('"623533895895"')).toBeInTheDocument();
    expect(getByText('Cancel')).toBeInTheDocument();
    expect(getByText('Delete')).toBeInTheDocument();
  });
});
