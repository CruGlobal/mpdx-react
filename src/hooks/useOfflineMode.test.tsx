import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import TestRouter from '__tests__/util/TestRouter';
import { useOfflineMode } from './useOfflineMode';

const renderWithQuery = (query: Record<string, string | string[]>) =>
  renderHook(() => useOfflineMode(), {
    wrapper: ({ children }: React.PropsWithChildren) => (
      <TestRouter router={{ query }}>{children}</TestRouter>
    ),
  }).result.current;

describe('useOfflineMode', () => {
  it('is true when offline=true', () => {
    expect(renderWithQuery({ offline: 'true' })).toBe(true);
  });

  it('is false when the parameter is missing', () => {
    expect(renderWithQuery({})).toBe(false);
  });

  it('is false when offline=false', () => {
    expect(renderWithQuery({ offline: 'false' })).toBe(false);
  });

  it('is true on the list view with a contact selected', () => {
    expect(renderWithQuery({ offline: 'true', contactId: ['abc'] })).toBe(true);
  });

  it('ignores the parameter on the Flows view', () => {
    expect(renderWithQuery({ offline: 'true', contactId: ['flows'] })).toBe(
      false,
    );
  });

  it('ignores the parameter on the Map view', () => {
    expect(renderWithQuery({ offline: 'true', contactId: ['map'] })).toBe(
      false,
    );
  });
});
