import { renderHook } from '@testing-library/react';
import { useUpdatedAt } from './useUpdatedAt';

const spy = jest
  .spyOn(Date, 'now')
  .mockReturnValue(Date.parse('2024-06-03T12:00:00Z'));
const updatedAt = new Date('2024-06-01T12:00:00Z');

describe('useUpdatedAt', () => {
  it('should return the time elapsed since the last update', () => {
    const { result } = renderHook(() => useUpdatedAt(updatedAt));
    expect(result.current).toEqual(`Updated 2 days ago`);

    spy.mockRestore();
  });
});
