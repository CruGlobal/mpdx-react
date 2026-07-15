import './sharedRechartMock';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { Bar, BarChart } from 'recharts';
import theme from 'src/theme';
import { ChartFrame } from './ChartFrame';

interface TestComponentProps {
  loading?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ loading }) => (
  <ThemeProvider theme={theme}>
    <ChartFrame width={80} aspect={2} loading={loading}>
      <BarChart data={[{ name: 'Income', total: 100 }]}>
        <Bar dataKey="total" />
      </BarChart>
    </ChartFrame>
  </ThemeProvider>
);

describe('ChartFrame', () => {
  it('renders the chart it is given', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(await findByRole('region')).toBeInTheDocument();
  });

  it('renders a spinner instead of the chart while loading', () => {
    const { getByTestId, queryByRole } = render(<TestComponent loading />);

    expect(getByTestId('loading-spinner')).toBeInTheDocument();
    expect(queryByRole('region')).not.toBeInTheDocument();
  });

  it('reserves the same space while loading as when loaded', () => {
    const { container: loadingContainer } = render(<TestComponent loading />);
    const { container: loadedContainer } = render(<TestComponent />);

    const loadingFrame = loadingContainer.firstChild as HTMLElement;
    const loadedFrame = loadedContainer.firstChild as HTMLElement;

    expect(loadingFrame).toHaveStyle({ width: '80%' });
    expect(loadedFrame).toHaveStyle({ width: '80%' });
    expect(loadingFrame.className).toEqual(loadedFrame.className);
  });
});
