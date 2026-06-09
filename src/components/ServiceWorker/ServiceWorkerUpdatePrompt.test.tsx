import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { ServiceWorkerUpdatePrompt } from './ServiceWorkerUpdatePrompt';

const mockRegister = jest.fn().mockResolvedValue(undefined);
const mockMessageSkipWaiting = jest.fn();
const listeners: Record<string, () => void> = {};

jest.mock('@serwist/window', () => ({
  Serwist: jest.fn().mockImplementation(() => ({
    register: mockRegister,
    messageSkipWaiting: mockMessageSkipWaiting,
    addEventListener: (event: string, callback: () => void) => {
      listeners[event] = callback;
    },
  })),
}));

const TestComponent: React.FC = () => (
  <SnackbarProvider>
    <ServiceWorkerUpdatePrompt />
  </SnackbarProvider>
);

describe('ServiceWorkerUpdatePrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ENABLE_SW = 'true';
    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: {},
      configurable: true,
    });
    Object.keys(listeners).forEach((key) => delete listeners[key]);
  });

  afterEach(() => {
    delete process.env.ENABLE_SW;
  });

  it('registers the service worker', async () => {
    render(<TestComponent />);

    await waitFor(() => expect(mockRegister).toHaveBeenCalled());
  });

  it('does not register when the service worker is disabled', () => {
    delete process.env.ENABLE_SW;

    render(<TestComponent />);

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows an update prompt when a new service worker is waiting and activates it on click', async () => {
    const { findByRole } = render(<TestComponent />);

    await waitFor(() => expect(listeners.waiting).toBeDefined());
    listeners.waiting();

    const updateButton = await findByRole('button', { name: 'Update' });
    await userEvent.click(updateButton);

    expect(mockMessageSkipWaiting).toHaveBeenCalled();
  });
});
