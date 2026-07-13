import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { SettingsButtonGroup } from './SettingsButtonGroup';

const setFilters = jest.fn();
const handleSettingsClick = jest.fn();

interface TestComponentProps {
  isFilterDateSelected?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  isFilterDateSelected = false,
}) => (
  <ThemeProvider theme={theme}>
    <SettingsButtonGroup
      isFilterDateSelected={isFilterDateSelected}
      setFilters={setFilters}
      handleSettingsClick={handleSettingsClick}
    />
  </ThemeProvider>
);

describe('SettingsButtonGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the report settings button', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('button', { name: 'Report Settings' }),
    ).toBeInTheDocument();
  });

  it('calls handleSettingsClick when the settings button is clicked', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Report Settings' }));

    expect(handleSettingsClick).toHaveBeenCalledTimes(1);
  });

  it('does not render the clear button when no filter date is selected', () => {
    const { queryByRole } = render(
      <TestComponent isFilterDateSelected={false} />,
    );

    expect(queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  });

  it('renders the clear button when a filter date is selected', () => {
    const { getByRole } = render(<TestComponent isFilterDateSelected={true} />);

    expect(getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('calls setFilters with null when the clear button is clicked', () => {
    const { getByRole } = render(<TestComponent isFilterDateSelected={true} />);

    userEvent.click(getByRole('button', { name: 'Clear' }));

    expect(setFilters).toHaveBeenCalledWith(null);
  });
});
