import mediaQuery from 'css-mediaquery';

// Some selectors that MUI emits (vendor pseudo-elements and the like) are not
// understood by jsdom's selector engine, so treat those as "does not match".
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

/**
 * jsdom's getComputedStyle skips `@media` rules, so responsive styles (MUI
 * `sx={{ prop: { xs, sm } }}` or `theme.breakpoints.*`) can't be checked with
 * `toHaveStyle`. This walks the stylesheets Emotion injected and works out
 * which value of `property` wins for `element` on a screen `width` pixels wide.
 *
 * It is a simplified cascade: rules are applied in source order (later wins),
 * media rules are kept only when their query matches `width`, and an inline
 * style beats every rule. Specificity and `!important` are ignored, so only
 * use it for properties that are set once per element (as Emotion does when
 * it merges a component's styles into one class).
 */
export const getStyleAtWidth = (
  element: Element,
  property: string,
  width: number,
): string => {
  let value = '';

  const visit = (rules: CSSRuleList): void => {
    Array.from(rules).forEach((rule) => {
      if (isMediaRule(rule)) {
        if (mediaQuery.match(rule.media.mediaText, { type: 'screen', width })) {
          visit(rule.cssRules);
        }
      } else if (isStyleRule(rule) && safeMatches(element, rule.selectorText)) {
        const ruleValue = rule.style.getPropertyValue(property);
        if (ruleValue) {
          value = ruleValue;
        }
      }
    });
  };

  Array.from(document.styleSheets).forEach((sheet) => visit(sheet.cssRules));

  const inlineValue =
    element instanceof HTMLElement
      ? element.style.getPropertyValue(property)
      : '';
  return inlineValue || value;
};

/**
 * How many columns an MUI Grid (v2) item spans on a screen `width` pixels
 * wide. Grid sizes each item with
 * `width: calc(100% * <columns> / var(--Grid-parent-columns) ...)`, so this
 * reads <columns> from the width that wins at that screen size. Returns
 * undefined when the item's width is not column based (e.g. `size="grow"`).
 */
export const getGridColumnsAtWidth = (
  gridItem: Element,
  width: number,
): number | undefined => {
  const match = getStyleAtWidth(gridItem, 'width', width).match(
    /100% \* (\d+) \//,
  );
  return match ? Number(match[1]) : undefined;
};

/** 390px matches the phone width used in the mobile audit. */
export const phoneWidth = 390;
/** Any width at or above MUI's `md` breakpoint counts as desktop. */
export const desktopWidth = 1280;
