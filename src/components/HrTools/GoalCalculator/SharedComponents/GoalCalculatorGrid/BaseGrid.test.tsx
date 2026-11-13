import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import { ThemeProvider } from '@mui/material/styles';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { render } from '@testing-library/react';
import mediaQuery from 'css-mediaquery';
import theme from 'src/theme';
import { BaseGrid } from './BaseGrid';

interface StyleOptions {
  // A phone with only a touchscreen, or a computer with only a mouse
  device: 'touch' | 'mouse';
  // Whether the mouse is over the element, which also hovers everything around
  // it
  hovered?: boolean;
}

const mediaValues = {
  touch: { type: 'screen', 'any-pointer': 'coarse', hover: 'none' },
  mouse: { type: 'screen', 'any-pointer': 'fine', hover: 'hover' },
};

// Some selectors MUI emits are not understood by jsdom, so treat them as "does
// not match"
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

// jsdom's getComputedStyle skips @media rules and :hover, so work out from the
// CSS Emotion injected which value of `property` wins for `element`. Rules apply
// in source order and specificity is ignored, which works here because each of
// BaseGrid's touch and hover rules repeats the selector of the rule it
// overrides.
const getStyle = (
  element: Element,
  property: string,
  { device, hovered = false }: StyleOptions,
): string => {
  let value = '';

  const visit = (rules: CSSRuleList): void => {
    Array.from(rules).forEach((rule) => {
      if (isMediaRule(rule)) {
        if (mediaQuery.match(rule.media.mediaText, mediaValues[device])) {
          visit(rule.cssRules);
        }
      } else if (isStyleRule(rule)) {
        const selector = hovered
          ? rule.selectorText.replace(/:hover/g, '')
          : rule.selectorText;
        if (safeMatches(element, selector)) {
          value = rule.style.getPropertyValue(property) || value;
        }
      }
    });
  };
  Array.from(document.styleSheets).forEach((sheet) => visit(sheet.cssRules));

  return value;
};

// An element can't be seen when it or anything around it has opacity 0, or
// when the closest visibility set on it or around it is hidden
const isHidden = (element: Element, options: StyleOptions): boolean => {
  let visibility = '';
  for (let node: Element | null = element; node; node = node.parentElement) {
    if (getStyle(node, 'opacity', options) === '0') {
      return true;
    }
    if (!visibility) {
      visibility = getStyle(node, 'visibility', options);
    }
  }
  return visibility === 'hidden';
};

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <BaseGrid
      rows={[
        { id: 'rent', label: 'Rent' },
        { id: 'housing', label: 'Housing' },
      ]}
      columns={[
        { field: 'label', headerName: 'Expense Name' },
        {
          field: 'actions',
          type: 'actions',
          getActions: (params) =>
            params.id === 'rent'
              ? [
                  <GridActionsCellItem
                    key="delete"
                    icon={<DeleteIcon />}
                    label="Delete"
                  />,
                ]
              : [
                  <GridActionsCellItem
                    key="cannot-delete"
                    icon={<DoNotDisturbAltIcon />}
                    label="Cannot delete"
                    disabled
                  />,
                ],
        },
      ]}
    />
  </ThemeProvider>
);

describe('BaseGrid', () => {
  describe('on touch screens', () => {
    it('shows the Delete button without a hover', () => {
      const { getByRole } = render(<TestComponent />);

      expect(
        isHidden(getByRole('menuitem', { name: 'Delete' }), {
          device: 'touch',
        }),
      ).toBe(false);
    });

    it('hides a disabled action but keeps its space', () => {
      const { getByRole } = render(<TestComponent />);

      const disabledAction = getByRole('menuitem', { name: 'Cannot delete' });
      expect(isHidden(disabledAction, { device: 'touch' })).toBe(true);
      // Hidden with visibility, not removed, so the column keeps its slot
      expect(getStyle(disabledAction, 'visibility', { device: 'touch' })).toBe(
        'hidden',
      );
      expect(getStyle(disabledAction, 'display', { device: 'touch' })).not.toBe(
        'none',
      );
    });
  });

  describe('with only a mouse', () => {
    it('keeps the Delete button hidden until the row is hovered', () => {
      const { getByRole } = render(<TestComponent />);

      const deleteButton = getByRole('menuitem', { name: 'Delete' });
      expect(isHidden(deleteButton, { device: 'mouse' })).toBe(true);
      expect(isHidden(deleteButton, { device: 'mouse', hovered: true })).toBe(
        false,
      );
    });

    it('keeps a disabled action hidden until the row is hovered', () => {
      const { getByRole } = render(<TestComponent />);

      const disabledAction = getByRole('menuitem', { name: 'Cannot delete' });
      expect(isHidden(disabledAction, { device: 'mouse' })).toBe(true);
      expect(isHidden(disabledAction, { device: 'mouse', hovered: true })).toBe(
        false,
      );
    });
  });
});
