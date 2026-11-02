import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import OfflinePage from './offline.page';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <OfflinePage />
  </ThemeProvider>
);

describe('Offline page', () => {
  const originalLocation = window.location;
  const reload = jest.fn();

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('tells the user they are offline', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: "You're offline" }),
    ).toBeInTheDocument();
    expect(
      getByText('Check your internet connection, then try again.'),
    ).toBeInTheDocument();
  });

  it('reloads the page when Retry is clicked', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Retry' }));

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
