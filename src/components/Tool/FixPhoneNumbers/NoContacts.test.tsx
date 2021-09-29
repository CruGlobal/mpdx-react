import { ThemeProvider } from '@material-ui/core';
import React from 'react';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import theme from '../../../theme';
import NoContacts from './NoContacts';

describe('FixPhoneNumbers-NoContacts', () => {
  it('default', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <NoContacts />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(
      getByText('No people with phone numbers need attention'),
    ).toBeInTheDocument();
    expect(
      getByText(
        'People with new phone numbers or multiple primary phone numbers will appear here.',
      ),
    ).toBeInTheDocument();
  });
});
