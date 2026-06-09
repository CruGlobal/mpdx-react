import { renderHook } from '@testing-library/react-hooks';
import { mockSession } from '__tests__/util/mockSession';
import { useDeveloperBypass } from './useDeveloperBypass';

describe('useDeveloperBypass', () => {
  afterEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
    mockSession();
  });

  it('is true in a development env for a developer', () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: true });

    const { result } = renderHook(() => useDeveloperBypass());

    expect(result.current).toBe(true);
  });

  it('is false in a development env for a non-developer', () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: false });

    const { result } = renderHook(() => useDeveloperBypass());

    expect(result.current).toBe(false);
  });

  // The production safety guarantee: a developer must never bypass gating
  // outside a development env.
  it('is false outside a development env for a developer', () => {
    process.env.DEVELOPMENT_ENV = 'false';
    mockSession({ developer: true });

    const { result } = renderHook(() => useDeveloperBypass());

    expect(result.current).toBe(false);
  });

  it('is false outside a development env for a non-developer', () => {
    process.env.DEVELOPMENT_ENV = 'false';
    mockSession({ developer: false });

    const { result } = renderHook(() => useDeveloperBypass());

    expect(result.current).toBe(false);
  });
});
