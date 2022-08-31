import React from 'react';
import { ThemeProvider } from '@mui/material';
import userEvent from '@testing-library/user-event';
import { EmptyReport } from './EmptyReport';
import { render } from '__tests__/util/testingLibraryReactMock';
import TestWrapper from '__tests__/util/TestWrapper';
import theme from 'src/theme';

describe('EmptyReport', () => {
  it('default', () => {
    const { getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <EmptyReport title="test title" subTitle="test subTitle" />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(queryByText('test title')).toBeInTheDocument();
    expect(queryByText('test subTitle')).toBeInTheDocument();
    userEvent.click(getByText('Add New Donation'));
  });

  it('should not render add new donation button', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <EmptyReport
            title="test title"
            subTitle="test subTitle"
            hasAddNewDonation={false}
          />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(queryByText('test title')).toBeInTheDocument();
    expect(queryByText('test subTitle')).toBeInTheDocument();
    expect(queryByText('Add New Donation')).not.toBeInTheDocument();
  });
});
