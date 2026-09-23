import { act, renderHook } from '@testing-library/react-hooks';
import { AssistantProvider, useAssistantContext } from './AssistantProvider';
import { useAssistantVisibility } from './useAssistantVisibility';

jest.mock('./useAssistantVisibility');
const mockUseAssistantVisibility = useAssistantVisibility as jest.MockedFn<
  typeof useAssistantVisibility
>;

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

  it('keeps messages across closing and reopening', () => {
    const { result } = renderHook(() => useAssistantContext(), {
      wrapper: AssistantProvider,
    });
    const message = {
      id: 'message-1',
      role: 'user' as const,
      content: 'Hi',
      cards: [],
      citations: [],
      status: 'complete' as const,
      working: false,
    };

    act(() => result.current.openAssistant());
    act(() => result.current.dispatch({ type: 'addMessage', message }));
    act(() => result.current.closeAssistant());
    act(() => result.current.openAssistant());

    expect(result.current.messages).toEqual([message]);
  });

  it('tracks streaming and aborts on stop', () => {
    const { result } = renderHook(() => useAssistantContext(), {
      wrapper: AssistantProvider,
    });
    const controller = new AbortController();

    act(() => result.current.beginStream(controller));
    expect(result.current.streaming).toBe(true);

    act(() => result.current.stopStream());
    expect(controller.signal.aborted).toBe(true);

    act(() => result.current.endStream());
    expect(result.current.streaming).toBe(false);
  });

  it('aborts the stream when the assistant becomes hidden', () => {
    mockUseAssistantVisibility.mockReturnValue(true);
    const { result, rerender } = renderHook(() => useAssistantContext(), {
      wrapper: AssistantProvider,
    });
    const controller = new AbortController();
    act(() => result.current.beginStream(controller));

    mockUseAssistantVisibility.mockReturnValue(false);
    rerender();

    expect(controller.signal.aborted).toBe(true);
  });
});
