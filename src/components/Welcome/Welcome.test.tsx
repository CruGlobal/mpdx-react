import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import theme from '../../theme';
import Welcome from '.';

const renderPage = () => {
  const utils = render(
    <ThemeProvider theme={theme}>
      <Welcome title="test title" subtitle="test subtitle">
        <div data-testid="children">children</div>
      </Welcome>
    </ThemeProvider>,
  );
  // The full-height blue box that holds the title, subtitle, and buttons
  const pageBox = utils.getByRole('main').firstElementChild as HTMLElement;
  return { ...utils, pageBox };
};

describe('Welcome', () => {
  describe('page layout', () => {
    it('starts the content at the top on phones', () => {
      const { pageBox } = renderPage();

      expect(getStyleAtWidth(pageBox, 'display', phoneWidth)).toBe('flex');
      expect(getStyleAtWidth(pageBox, 'align-items', phoneWidth)).toBe(
        'flex-start',
      );
      // The widest phone width before MUI's `sm` breakpoint (600px)
      expect(getStyleAtWidth(pageBox, 'align-items', 599)).toBe('flex-start');
    });

    it('keeps the content vertically centered on tablets and desktops', () => {
      const { pageBox } = renderPage();

      expect(getStyleAtWidth(pageBox, 'display', desktopWidth)).toBe('flex');
      expect(getStyleAtWidth(pageBox, 'align-items', 600)).toBe('center');
      expect(getStyleAtWidth(pageBox, 'align-items', desktopWidth)).toBe(
        'center',
      );
    });

    it('fills the whole screen at every width', () => {
      const { pageBox } = renderPage();

      [phoneWidth, desktopWidth].forEach((width) => {
        expect(getStyleAtWidth(pageBox, 'min-height', width)).toBe('100vh');
      });
    });
  });

  it('has correct defaults', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Welcome title="test title" subtitle="test subtitle">
          <div data-testid="children">children</div>
        </Welcome>
      </ThemeProvider>,
    );
    expect(getByTestId('welcomeTitle')).toHaveTextContent('test title');
    expect(getByTestId('welcomeSubtitle')).toHaveTextContent('test subtitle');
    expect(getByTestId('welcomeImg')).toHaveAttribute('src');
    expect(getByTestId('children')).toHaveTextContent('children');
  });

  it('has correct overrides', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Welcome
          title={<div data-testid="testTitle">test title</div>}
          subtitle={<div data-testid="testSubtitle">test subtitle</div>}
          imgSrc={require(
            `../../images/drawkit/grape/drawkit-grape-pack-illustration-1.svg`,
          )}
        />
      </ThemeProvider>,
    );
    expect(() => getByTestId('welcomeTitle')).toThrow();
    expect(() => getByTestId('welcomeSubtitle')).toThrow();
    expect(getByTestId('testTitle')).toHaveTextContent('test title');
    expect(getByTestId('testSubtitle')).toHaveTextContent('test subtitle');
    expect(getByTestId('welcomeImg')).toHaveAttribute('src');
  });
});
