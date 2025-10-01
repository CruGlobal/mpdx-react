import { renderHook } from '@testing-library/react';
import { DateTime, Settings } from 'luxon';
import { useUpdatedAt } from './useUpdatedAt';

const locale = 'en-US';

describe('useUpdatedAt', () => {
  beforeEach(() => {
    Settings.now = () => Date.parse('2024-06-03T12:00:00Z');
  });

  it('should return the time elapsed since the last update', () => {
    const updatedAt = DateTime.fromISO('2024-06-01T12:00:00Z');

    const { result } = renderHook(() => useUpdatedAt(updatedAt, locale));
    expect(result.current).toEqual(`Updated 2 days ago`);
  });
});
