import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { ReportLayout } from './ReportLayout';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

describe('ReportLayout', () => {
  it('default', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <ReportLayout selectedId="test">
            <div data-testid="children"></div>
          </ReportLayout>
        </TestRouter>
      </ThemeProvider>,
    );
    const element = getByTestId('children');
    expect(element).toBeInTheDocument();
  });
});
