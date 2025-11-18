import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum } from '../Shared/sharedTypes';
import { ViewRequestPage } from './ViewRequestPage';

const setHasCalcValues = jest.fn();
const setIsPrint = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <MinisterHousingAllowanceProvider>
        <ViewRequestPage />
      </MinisterHousingAllowanceProvider>
    </TestRouter>
  </ThemeProvider>
);

jest.mock('../Shared/Context/MinisterHousingAllowanceContext', () => ({
  ...jest.requireActual('../Shared/Context/MinisterHousingAllowanceContext'),
  useMinisterHousingAllowance: jest.fn(),
}));

(useMinisterHousingAllowance as jest.Mock).mockReturnValue({
  pageType: PageEnum.View,
  setHasCalcValues,
  setIsPrint,
});

describe('ViewRequestPage', () => {
  it('renders empty panel layout,', () => {
    const { getByText, queryByRole, getByTestId } = render(<TestComponent />);

    expect(getByText('Your MHA')).toBeInTheDocument();
    expect(queryByRole('progressbar')).not.toBeInTheDocument();
    expect(getByTestId('ArrowBackIcon')).toBeInTheDocument();
  });

  it('should have disabled text fields', () => {
    const { getByRole } = render(<TestComponent />);

    const row = getByRole('row', {
      name: /estimated monthly cost of repairs/i,
    });
    const input = within(row).getByRole('textbox');

    expect(input).toBeDisabled();
  });
});
