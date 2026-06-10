import React from 'react';
import { act, render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { OfflineNotifier } from './OfflineNotifier';

const TestComponent: React.FC = () => (
  <SnackbarProvider>
    <OfflineNotifier />
  </SnackbarProvider>
);

describe('OfflineNotifier', () => {
  it('shows nothing while online', () => {
    const { queryByText } = render(<TestComponent />);

    expect(
      queryByText('You are offline. Changes cannot be saved until you reconnect.'),
    ).not.toBeInTheDocument();
  });

  it('shows a persistent warning while offline and removes it on reconnect', async () => {
    const { findByText } = render(<TestComponent />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(
      await findByText(
        'You are offline. Changes cannot be saved until you reconnect.',
      ),
    ).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(await findByText('You are back online.')).toBeInTheDocument();
  });
});
