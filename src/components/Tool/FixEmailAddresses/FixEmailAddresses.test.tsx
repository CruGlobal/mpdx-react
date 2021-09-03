import { ThemeProvider } from '@material-ui/core';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import theme from '../../../theme';
import FixEmailAddresses from './FixEmailAddreses';

describe('FixEmailAddresses-Home', () => {
  it('default with test data', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixEmailAddresses />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(getByText('Fix Email Addresses')).toBeInTheDocument();
    expect(
      getByText('You have 2 email addresses to confirm.'),
    ).toBeInTheDocument();
    expect(getByText('Confirm 2 as MPDX')).toBeInTheDocument();
    expect(getByText('Test Contact')).toBeInTheDocument();
    expect(getByText('Simba Lion')).toBeInTheDocument();
  });

  it('change test data', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <FixEmailAddresses />
        </TestWrapper>
      </ThemeProvider>,
    );

    const button = getByTestId('changeTestData');
    userEvent.click(button);

    expect(
      getByText('No people with email addresses need attention'),
    ).toBeInTheDocument();
    expect(
      getByText(
        'People with new email addresses or multiple primary email addresses will appear here.',
      ),
    ).toBeInTheDocument();
  });
});
