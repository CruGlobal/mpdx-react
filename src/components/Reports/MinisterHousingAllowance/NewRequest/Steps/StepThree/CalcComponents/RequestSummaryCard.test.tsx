import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { RentOwnEnum } from 'src/components/Reports/MinisterHousingAllowance/Shared/sharedTypes';
import theme from 'src/theme';
import { RequestSummaryCard } from './RequestSummaryCard';

interface TestComponentProps {
  rentOrOwn?: RentOwnEnum;
}

//TODO: Test main calculation

const TestComponent: React.FC<TestComponentProps> = ({ rentOrOwn }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <RequestSummaryCard rentOrOwn={rentOrOwn} />
    </TestRouter>
  </ThemeProvider>
);

describe('RequestSummaryCard', () => {
  it('renders the card for own', () => {
    const { getByText } = render(<TestComponent rentOrOwn={RentOwnEnum.Own} />);

    expect(getByText('Your MHA Request Summary')).toBeInTheDocument();
    expect(getByText('Own')).toBeInTheDocument();
    expect(getByText('Your Annual MHA Total')).toBeInTheDocument();
    expect(
      getByText(/This is calculated from your above responses/),
    ).toBeInTheDocument();
  });

  it('renders the card for rent', () => {
    const { getByText } = render(
      <TestComponent rentOrOwn={RentOwnEnum.Rent} />,
    );

    expect(getByText('Your MHA Request Summary')).toBeInTheDocument();
    expect(getByText('Rent')).toBeInTheDocument();
  });
});
