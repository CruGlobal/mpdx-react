import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
import { CircularProgressWithLabel } from './CircularProgressWithLabel';

interface TestComponentProps {
  progress?: number;
  loading?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  progress = 0,
  loading,
}) => (
  <ThemeProvider theme={theme}>
    <CircularProgressWithLabel progress={progress} loading={loading} />
  </ThemeProvider>
);

describe('CircularProgressWithLabel', () => {
  it('renders the determinate progressbar with a static accessible name and aria-valuenow', () => {
    const { getByRole } = render(<TestComponent progress={25} />);

    const progressbar = getByRole('progressbar', { name: 'Section progress' });
    expect(progressbar).toHaveAttribute('aria-valuenow', '25');
  });

  it('does not duplicate the percentage in the accessible name', () => {
    const { getByRole } = render(<TestComponent progress={25} />);

    expect(
      getByRole('progressbar', { name: 'Section progress' }),
    ).toBeInTheDocument();
  });

  it('hides the visual percentage label from assistive tech', () => {
    const { getByText } = render(<TestComponent progress={25} />);

    expect(getByText('25%')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders an indeterminate progressbar with a calculating label when loading', () => {
    const { getByRole, queryByText } = render(
      <TestComponent loading progress={25} />,
    );

    const progressbar = getByRole('progressbar', {
      name: 'Calculating progress',
    });
    expect(progressbar).not.toHaveAttribute('aria-valuenow');
    expect(queryByText('25%')).not.toBeInTheDocument();
  });
});
