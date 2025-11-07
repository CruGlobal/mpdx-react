import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, within } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { PageEnum } from '../../../Shared/sharedTypes';
import { Receipt } from './Receipt';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter>
        <Receipt type={PageEnum.New} />
      </TestRouter>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('Receipt', () => {
  it('renders the component', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', {
        name: 'Thank you for Submitting your MHA Request!',
      }),
    ).toBeInTheDocument();

    expect(getByRole('alert')).toBeInTheDocument();
    expect(
      within(getByRole('alert')).getByText(
        /you've successfully submitted your mha request!/i,
      ),
    ).toBeInTheDocument();

    expect(getByRole('button', { name: /view your mha/i })).toBeInTheDocument();
  });
});
