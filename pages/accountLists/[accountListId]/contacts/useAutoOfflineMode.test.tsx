import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import TestRouter from '__tests__/util/TestRouter';
import { useCachedContactsAvailable } from 'src/hooks/useCachedContactsAvailable';
import { useIsOnline } from 'src/hooks/useIsOnline';
import { useAutoOfflineMode } from './useAutoOfflineMode';

jest.mock('src/hooks/useCachedContactsAvailable');
jest.mock('src/hooks/useIsOnline');

const mockAvailable = useCachedContactsAvailable as jest.Mock;
const mockOnline = useIsOnline as jest.Mock;

const replace = jest.fn();

const renderAuto = (query: Record<string, string | string[]> = {}) =>
  renderHook(() => useAutoOfflineMode('a'), {
    wrapper: ({ children }: React.PropsWithChildren) => (
      <TestRouter
        router={{
          pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
          query: { accountListId: 'a', ...query },
          replace,
        }}
      >
        {children}
      </TestRouter>
    ),
  });

describe('useAutoOfflineMode', () => {
  beforeEach(() => {
    mockOnline.mockReturnValue(false);
    mockAvailable.mockReturnValue(true);
  });

  it('replaces the URL when offline at mount with cached contacts', () => {
    renderAuto();

    expect(replace).toHaveBeenCalledWith(
      {
        pathname: '/accountLists/[accountListId]/contacts/[[...contactId]]',
        query: { accountListId: 'a', offline: 'true' },
      },
      undefined,
      { shallow: true },
    );
  });

  it('keeps the contactId', () => {
    renderAuto({ contactId: ['contact-1'] });

    expect(replace).toHaveBeenCalledWith(
      expect.objectContaining({
        query: {
          accountListId: 'a',
          contactId: ['contact-1'],
          offline: 'true',
        },
      }),
      undefined,
      { shallow: true },
    );
  });

  it('does not switch with filters', () => {
    renderAuto({ filters: '{}' });
    expect(replace).not.toHaveBeenCalled();
  });

  it('does not switch with a search term', () => {
    renderAuto({ searchTerm: 'abc' });
    expect(replace).not.toHaveBeenCalled();
  });

  it('does not switch on the Flows view', () => {
    renderAuto({ contactId: ['flows'] });
    expect(replace).not.toHaveBeenCalled();
  });

  it('does not switch on the Map view', () => {
    renderAuto({ contactId: ['map'] });
    expect(replace).not.toHaveBeenCalled();
  });

  it('does not switch when already in offline mode', () => {
    renderAuto({ offline: 'true' });
    expect(replace).not.toHaveBeenCalled();
  });

  it('does not switch when no cached contacts are available', () => {
    mockAvailable.mockReturnValue(false);
    renderAuto();
    expect(replace).not.toHaveBeenCalled();
  });

  it('does not switch when online at mount', () => {
    mockOnline.mockReturnValue(true);
    renderAuto();
    expect(replace).not.toHaveBeenCalled();
  });

  it('does not switch when the device goes offline after mount', () => {
    mockOnline.mockReturnValue(true);
    const { rerender } = renderAuto();

    mockOnline.mockReturnValue(false);
    rerender();

    expect(replace).not.toHaveBeenCalled();
  });

  it('waits while availability is undefined, then evaluates once', () => {
    mockAvailable.mockReturnValue(undefined);
    const { rerender } = renderAuto();
    expect(replace).not.toHaveBeenCalled();

    mockAvailable.mockReturnValue(true);
    rerender();
    expect(replace).toHaveBeenCalledTimes(1);

    mockAvailable.mockReturnValue(undefined);
    rerender();
    mockAvailable.mockReturnValue(true);
    rerender();
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it('does not switch later if the first evaluation said no', () => {
    mockAvailable.mockReturnValue(false);
    const { rerender } = renderAuto();

    mockAvailable.mockReturnValue(true);
    rerender();

    expect(replace).not.toHaveBeenCalled();
  });
});
