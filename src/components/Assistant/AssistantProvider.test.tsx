import { act, renderHook } from '@testing-library/react-hooks';
import { AssistantProvider, useAssistantContext } from './AssistantProvider';

describe('AssistantProvider', () => {
  it('throws when used outside of the provider', () => {
    const { result } = renderHook(() => useAssistantContext());

    expect(result.error?.message).toBe(
      'Could not find AssistantContext. Make sure that your component is inside <AssistantProvider>.',
    );
  });

  it('opens and closes the assistant', () => {
    const { result } = renderHook(() => useAssistantContext(), {
      wrapper: AssistantProvider,
    });

    expect(result.current.open).toBe(false);
    act(() => result.current.openAssistant());
    expect(result.current.open).toBe(true);
    act(() => result.current.closeAssistant());
    expect(result.current.open).toBe(false);
  });
});
