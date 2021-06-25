import React from 'react';
import { ThemeProvider } from '@material-ui/core';
import { EmptyReport } from './EmptyReport';
import { render } from '__tests__/util/testingLibraryReactMock';
import TestWrapper from '__tests__/util/TestWrapper';
import theme from 'src/theme';

describe('EmptyReport', () => {
  it('default', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper initialState={{}}>
          <EmptyReport title="test title" subTitle="test subTitle" />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(queryByText('test title')).toBeInTheDocument();
    expect(queryByText('test subTitle')).toBeInTheDocument();
  });
});
