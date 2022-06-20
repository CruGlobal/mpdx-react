import { ThemeProvider } from '@material-ui/core';
import React from 'react';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import theme from '../../../theme';
import DeleteModal from './DeleteModal';

const testState = {
  open: true,
  personId: '',
  emailIndex: 0,
  emailAddress: 'test@test.com',
};

describe('FixEmailAddresses-DeleteModal', () => {
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
      getByText('Are you sure you wish to delete this email address:'),
    ).toBeInTheDocument();
    expect(getByText('"test@test.com"')).toBeInTheDocument();
    expect(getByText('Cancel')).toBeInTheDocument();
    expect(getByText('Delete')).toBeInTheDocument();
  });
});
