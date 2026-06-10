import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import Offline from './offline.page';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <Offline />
  </ThemeProvider>
);

describe('Offline page', () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('renders the offline message', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('You are offline.')).toBeInTheDocument();
    expect(
      getByText(
        'This page is not available offline. Check your internet connection and try again.',
      ),
    ).toBeInTheDocument();
  });

  it('reloads the page when Try Again is clicked', async () => {
    const reload = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload },
    });

    const { getByRole } = render(<TestComponent />);

    await userEvent.click(getByRole('button', { name: 'Try Again' }));
    expect(reload).toHaveBeenCalled();
  });
});
