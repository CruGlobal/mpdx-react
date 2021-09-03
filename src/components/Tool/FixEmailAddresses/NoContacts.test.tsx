import { ThemeProvider } from '@material-ui/core';
import React from 'react';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import theme from '../../../theme';
import NoContacts from './NoContacts';

describe('FixEmailAddresses-NoContacts', () => {
  it('default', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <NoContacts />
        </TestWrapper>
      </ThemeProvider>,
    );

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
