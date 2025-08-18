import { renderHook } from '@testing-library/react-hooks';
import { Settings } from 'luxon';
import { useGreeting } from './useGreeting';

describe('useGreeting', () => {
  it('returns "Good Morning," before 12pm', () => {
    // time set to 11:45 AM
    Settings.now = () => new Date(2020, 0, 0, 11, 45).valueOf();
    const { result } = renderHook(() => useGreeting(''));
    expect(result.current).toBe('Good Morning,');
  });

  it('returns "Good Afternoon," between 12pm and 6pm', () => {
    // time set to 3:30 PM
    Settings.now = () => new Date(2020, 0, 0, 15, 30).valueOf();
    const { result } = renderHook(() => useGreeting(''));
    expect(result.current).toBe('Good Afternoon,');
  });

  it('returns "Good Evening," after 6pm', () => {
    // time set to 6:10 PM
    Settings.now = () => new Date(2020, 0, 0, 18, 10).valueOf();
    const { result } = renderHook(() => useGreeting(''));
    expect(result.current).toBe('Good Evening,');
  });

  it('appends firstName if provided (morning)', () => {
    // time set to 9:30 AM
    Settings.now = () => new Date(2020, 0, 0, 9, 30).valueOf();
    const { result } = renderHook(() => useGreeting('Bob'));
    expect(result.current).toBe('Good Morning, Bob.');
  });

  it('appends firstName if provided (afternoon)', () => {
    // time set to 2:15 PM
    Settings.now = () => new Date(2020, 0, 0, 14, 15).valueOf();
    const { result } = renderHook(() => useGreeting('Bob'));
    expect(result.current).toBe('Good Afternoon, Bob.');
  });

  it('appends firstName if provided (evening)', () => {
    // time set to 7:30 PM
    Settings.now = () => new Date(2020, 0, 0, 19, 30).valueOf();
    const { result } = renderHook(() => useGreeting('Bob'));
    expect(result.current).toBe('Good Evening, Bob.');
  });

  it('handles undefined firstName gracefully', () => {
    // time set to 10:00 AM
    Settings.now = () => new Date(2020, 0, 0, 10, 0).valueOf();
    const { result } = renderHook(() => useGreeting(undefined));
    expect(result.current).toBe('Good Morning,');
  });
});
