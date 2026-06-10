import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
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
  // Save original so we can restore it after tests that remove serviceWorker
  let originalServiceWorker: unknown;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ENABLE_SW = 'true';
    originalServiceWorker = window.navigator.serviceWorker;
    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: {},
      configurable: true,
    });
    Object.keys(listeners).forEach((key) => delete listeners[key]);
  });

  afterEach(() => {
    delete process.env.ENABLE_SW;
    // Restore serviceWorker so other tests are not affected
    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: originalServiceWorker,
      configurable: true,
    });
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

  it('does not register when the browser lacks service worker support', () => {
    // Delete serviceWorker from navigator so 'serviceWorker' in navigator is false,
    // simulating an unsupported browser (e.g. non-HTTPS context or old browser).
    // beforeEach sets it as configurable so deletion works.
    delete (window.navigator as { serviceWorker?: unknown }).serviceWorker;

    render(<TestComponent />);

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows an update prompt when a new service worker is waiting and activates it on click', async () => {
    const { findByRole } = render(<TestComponent />);

    await waitFor(() => expect(listeners.waiting).toBeDefined());

    act(() => {
      listeners.waiting();
    });

    const updateButton = await findByRole('button', { name: 'Update' });
    await userEvent.click(updateButton);

    expect(mockMessageSkipWaiting).toHaveBeenCalled();
  });

  it('reloads the page when the new service worker takes control', async () => {
    const originalLocation = window.location;
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload: mockReload },
      configurable: true,
    });

    render(<TestComponent />);

    await waitFor(() => {
      expect(listeners.waiting).toBeDefined();
      expect(listeners.controlling).toBeDefined();
    });

    act(() => {
      listeners.waiting();
      listeners.controlling();
    });

    expect(mockReload).toHaveBeenCalled();

    // Restore
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      configurable: true,
    });
  });

  it('dismisses the prompt without updating when Later is clicked', async () => {
    const { findByRole, queryByText } = render(<TestComponent />);

    await waitFor(() => expect(listeners.waiting).toBeDefined());

    act(() => {
      listeners.waiting();
    });

    const laterButton = await findByRole('button', { name: 'Later' });
    await userEvent.click(laterButton);

    expect(mockMessageSkipWaiting).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(
        queryByText(
          'A new version of the app is available. Updating will reload the page.',
        ),
      ).not.toBeInTheDocument(),
    );
  });
});
