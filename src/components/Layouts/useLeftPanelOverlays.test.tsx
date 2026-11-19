import { ReactElement } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { renderHook } from '@testing-library/react-hooks';
import matchMediaMock from '__tests__/util/matchMediaMock';
import theme from 'src/theme';
import {
  useCloseLeftPanelWhenOverlaid,
  useLeftPanelOverlays,
} from './useLeftPanelOverlays';

const Wrapper = ({ children }: { children: ReactElement }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('useLeftPanelOverlays', () => {
  it('is true on small screens', () => {
    matchMediaMock({ width: '390px' });
    const { result } = renderHook(() => useLeftPanelOverlays(), {
      wrapper: Wrapper,
    });

    expect(result.current).toBe(true);
  });

  it('is false on larger screens', () => {
    matchMediaMock({ width: '1024px' });
    const { result } = renderHook(() => useLeftPanelOverlays(), {
      wrapper: Wrapper,
    });

    expect(result.current).toBe(false);
  });
});

describe('useCloseLeftPanelWhenOverlaid', () => {
  it('closes once on small screens, even when the callback changes', () => {
    matchMediaMock({ width: '390px' });
    const close = jest.fn();
    let onClose = close;
    const { rerender } = renderHook(
      () => useCloseLeftPanelWhenOverlaid(onClose),
      { wrapper: Wrapper },
    );

    expect(close).toHaveBeenCalledTimes(1);

    const newClose = jest.fn();
    onClose = newClose;
    rerender();

    expect(close).toHaveBeenCalledTimes(1);
    expect(newClose).not.toHaveBeenCalled();
  });

  it('does not close on larger screens', () => {
    matchMediaMock({ width: '1024px' });
    const close = jest.fn();
    renderHook(() => useCloseLeftPanelWhenOverlaid(close), {
      wrapper: Wrapper,
    });

    expect(close).not.toHaveBeenCalled();
  });

  it('closes when the screen shrinks to a small size', () => {
    matchMediaMock({ width: '1024px' });
    const close = jest.fn();
    const { rerender } = renderHook(
      () => useCloseLeftPanelWhenOverlaid(close),
      { wrapper: Wrapper },
    );
    expect(close).not.toHaveBeenCalled();

    matchMediaMock({ width: '390px' });
    rerender();

    expect(close).toHaveBeenCalledTimes(1);
  });
});
