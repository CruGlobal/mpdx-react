import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme';
import { EmptyDonationsTable } from './EmptyDonationsTable';

it('renders', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <EmptyDonationsTable
        title={'You have no expected donations this month'}
      />
    </ThemeProvider>,
  );

  expect(
    getByText('You have no expected donations this month'),
  ).toBeInTheDocument();
});
