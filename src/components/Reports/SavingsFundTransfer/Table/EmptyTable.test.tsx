import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { EmptyTable } from './EmptyTable';

const title = 'Test Title';
const subtitle = 'Test Subtitle';

describe('EmptyTable', () => {
  it('renders empty report with title and subtitle', () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <EmptyTable title={title} subtitle={subtitle} />
      </ThemeProvider>,
    );

    expect(getByRole('heading', { name: title })).toBeInTheDocument();
    expect(getByText(subtitle)).toBeInTheDocument();
  });
});
