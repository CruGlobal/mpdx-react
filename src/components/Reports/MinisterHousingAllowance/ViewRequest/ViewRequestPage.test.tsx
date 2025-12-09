import { useRouter } from 'next/router';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { PageEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { ViewRequestPage } from './ViewRequestPage';

const back = jest.fn();
const setHasCalcValues = jest.fn();
const setIsPrint = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <SnackbarProvider>
        <GqlMockedProvider>
          <MinisterHousingAllowanceProvider>
            <ViewRequestPage />
          </MinisterHousingAllowanceProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
(useRouter as jest.Mock).mockReturnValue({
  back,
  pathname: '/reports/housingAllowance/edit',
  query: {},
});

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
  it('renders empty panel layout,', async () => {
    const { queryByRole, queryByTestId, findByText } = render(
      <TestComponent />,
    );

    expect(await findByText('Your MHA')).toBeInTheDocument();
    expect(queryByRole('progressbar')).not.toBeInTheDocument();
    expect(queryByTestId('ArrowBackIcon')).not.toBeInTheDocument();
  });

  it('should have disabled text fields', async () => {
    const { findByRole } = render(<TestComponent />);

    const row = await findByRole('row', {
      name: /estimated monthly cost of repairs/i,
    });
    const input = within(row).getByRole('textbox');

    expect(input).toBeDisabled();
  });
});
