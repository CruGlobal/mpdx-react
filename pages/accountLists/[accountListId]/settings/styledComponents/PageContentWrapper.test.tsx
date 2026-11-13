import { Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import mediaQuery from 'css-mediaquery';
import theme from 'src/theme';
import { PageContentWrapper } from './PageContentWrapper';

// jsdom can't parse some selectors MUI writes, so treat those as not matching
const safeMatches = (element: Element, selector: string): boolean => {
  try {
    return element.matches(selector);
  } catch {
    return false;
  }
};

const isMediaRule = (rule: CSSRule): rule is CSSMediaRule =>
  'media' in rule && 'cssRules' in rule;

const isStyleRule = (rule: CSSRule): rule is CSSStyleRule =>
  'selectorText' in rule && 'style' in rule;

// getStyleAtWidth can't match ::after rules, so this reads them itself and works out how tall the
// block after the wrapper's content is on a screen `width` pixels wide. Later rules win.
const getEndBlockHeight = (element: Element, width: number): number => {
  const styles = new Map<string, string>();
  const visit = (rules: CSSRuleList): void => {
    Array.from(rules).forEach((rule) => {
      if (isMediaRule(rule)) {
        if (mediaQuery.match(rule.media.mediaText, { type: 'screen', width })) {
          visit(rule.cssRules);
        }
        return;
      }
      const afterSelector = isStyleRule(rule)
        ? rule.selectorText.match(/^(.+?)::?after$/)
        : null;
      if (!isStyleRule(rule) || !afterSelector) {
        return;
      }
      if (!safeMatches(element, afterSelector[1])) {
        return;
      }
      ['content', 'display', 'height', 'padding-top', 'padding-bottom'].forEach(
        (property) => {
          const value = rule.style.getPropertyValue(property);
          if (value) {
            styles.set(property, value);
          }
        },
      );
    });
  };
  Array.from(document.styleSheets).forEach((sheet) => visit(sheet.cssRules));

  // Without content the block isn't drawn, and an inline one adds no height
  const display = styles.get('display');
  if (!styles.get('content') || !display || display === 'inline') {
    return 0;
  }
  return ['height', 'padding-top', 'padding-bottom'].reduce(
    (total, property) => total + (parseFloat(styles.get(property) ?? '') || 0),
    0,
  );
};

describe('PageContentWrapper', () => {
  it('ends with room so the last setting can scroll clear of the help button', () => {
    const { container, getByRole } = render(
      <ThemeProvider theme={theme}>
        <PageContentWrapper maxWidth="lg">
          <Button>Reset Welcome Tour</Button>
        </PageContentWrapper>
      </ThemeProvider>,
    );

    const wrapper = container.firstElementChild;
    if (!wrapper) {
      throw new Error('The wrapper rendered nothing');
    }
    expect(wrapper).toContainElement(
      getByRole('button', { name: 'Reset Welcome Tour' }),
    );
    // The help button covers about 76px at the bottom of phones and 176px from 600px up
    expect(getEndBlockHeight(wrapper, 360)).toBeGreaterThanOrEqual(76);
    expect(getEndBlockHeight(wrapper, 390)).toBeGreaterThanOrEqual(76);
    expect(getEndBlockHeight(wrapper, 768)).toBeGreaterThanOrEqual(176);
    expect(getEndBlockHeight(wrapper, 1280)).toBeGreaterThanOrEqual(176);
  });
});
