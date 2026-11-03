import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import theme from 'src/theme';
import { FlowsScrollHint } from './FlowsScrollHint';

const hintText = 'Scroll sideways to see more columns.';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <FlowsScrollHint />
  </ThemeProvider>
);

describe('FlowsScrollHint', () => {
  it('tells the user to scroll sideways and shows a swipe icon', () => {
    const { getByText, getByTestId } = render(<TestComponent />);

    expect(getByText(hintText)).toBeInTheDocument();
    expect(getByTestId('SwipeIcon')).toBeInTheDocument();
  });

  it('shows the hint on phones', () => {
    const { getByText } = render(<TestComponent />);
    const hint = getByText(hintText);

    expect(getStyleAtWidth(hint, 'display', phoneWidth)).toBe('flex');
    // The widest phone width before MUI's `sm` breakpoint (600px)
    expect(getStyleAtWidth(hint, 'display', 599)).toBe('flex');
  });

  it('hides the hint on tablets and desktops', () => {
    const { getByText } = render(<TestComponent />);
    const hint = getByText(hintText);

    expect(getStyleAtWidth(hint, 'display', 600)).toBe('none');
    expect(getStyleAtWidth(hint, 'display', desktopWidth)).toBe('none');
  });
});
