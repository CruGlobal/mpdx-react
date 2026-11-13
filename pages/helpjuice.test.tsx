import fs from 'fs';
import path from 'path';
import React from 'react';
import { Dialog, DialogTitle } from '@mui/material';
import { render, waitFor } from '@testing-library/react';
import matchMediaMock from '__tests__/util/matchMediaMock';

/*
 * jsdom can't load helpjuice.css (its parser rejects CSS nesting) and its selector engine has no
 * :has(). So these tests read the file with the small reader below and check each rule against the
 * page themselves. Screen widths are checked with the same media query helper the other tests use.
 */

interface CssRule {
  selector: string;
  // The condition of each @media block the rule sits in
  media: string[];
  declarations: Record<string, string>;
}

const parseCss = (source: string): CssRule[] => {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules: CssRule[] = [];
  let index = 0;

  // Reads a block from just after its "{" up to its "}". The top of the file has no selector.
  const readBlock = (selector: string | null, media: string[]): void => {
    const rule: CssRule | null = selector
      ? { selector, media, declarations: {} }
      : null;
    if (rule) {
      rules.push(rule);
    }
    let buffer = '';
    const addDeclaration = () => {
      const colon = buffer.indexOf(':');
      if (rule && colon > 0) {
        const property = buffer.slice(0, colon).trim().toLowerCase();
        rule.declarations[property] = buffer.slice(colon + 1).trim();
      }
      buffer = '';
    };

    while (index < text.length) {
      const char = text[index++];
      if (char === '{') {
        const prelude = buffer.trim();
        buffer = '';
        if (prelude.startsWith('@media')) {
          readBlock(selector, [
            ...media,
            prelude.slice('@media'.length).trim(),
          ]);
        } else if (prelude.startsWith('@') || selector) {
          throw new Error(`This test can't read this block yet: ${prelude}`);
        } else {
          readBlock(prelude, media);
        }
      } else if (char === ';') {
        addDeclaration();
      } else if (char === '}') {
        break;
      } else {
        buffer += char;
      }
    }
    addDeclaration();
  };

  readBlock(null, []);
  return rules;
};

/*
 * Swaps each :has(...) for a marker attribute on the elements that have a matching descendant,
 * then lets jsdom match the rest of the selector. The markers are removed before it returns.
 * Don't call this inside waitFor: waitFor reruns on every attribute change, so it never settles.
 */
const matchesSelector = (element: Element, selector: string): boolean => {
  const markers: string[] = [];
  let rewritten = selector;
  let start = rewritten.indexOf(':has(');
  while (start !== -1) {
    let depth = 0;
    let end = start + ':has'.length;
    do {
      if (rewritten[end] === '(') {
        depth++;
      } else if (rewritten[end] === ')') {
        depth--;
      }
      end++;
    } while (depth > 0 && end < rewritten.length);

    const inner = rewritten.slice(start + ':has('.length, end - 1).trim();
    if (/^[>+~]/.test(inner)) {
      throw new Error(`This test only handles descendant :has(): ${selector}`);
    }
    const marker = `data-test-has-${markers.length}`;
    markers.push(marker);
    document.querySelectorAll('*').forEach((candidate) => {
      if (candidate.querySelector(inner)) {
        candidate.setAttribute(marker, '');
      }
    });
    rewritten = `${rewritten.slice(0, start)}[${marker}]${rewritten.slice(end)}`;
    start = rewritten.indexOf(':has(');
  }

  try {
    return element.matches(rewritten);
  } finally {
    markers.forEach((marker) =>
      document
        .querySelectorAll(`[${marker}]`)
        .forEach((marked) => marked.removeAttribute(marker)),
    );
  }
};

const rules = parseCss(
  fs.readFileSync(path.join(__dirname, 'helpjuice.css'), 'utf8'),
);

/*
 * The value our stylesheet gives a property on the element when the screen is this many pixels
 * wide. If several rules set it, the last one in the file wins. This skips specificity, which is
 * fine for the rules these tests look at.
 */
const styleAt = (
  element: Element,
  property: string,
  width: number,
): string | undefined => {
  matchMediaMock({ width });
  let value: string | undefined;
  rules.forEach((rule) => {
    if (
      property in rule.declarations &&
      matchesSelector(element, rule.selector) &&
      rule.media.every((condition) => window.matchMedia(condition).matches)
    ) {
      value = rule.declarations[property];
    }
  });
  return value;
};

const getWidget = (): HTMLElement => {
  const widget = document.getElementById('helpjuice-widget');
  if (!widget) {
    throw new Error('The help widget is missing');
  }
  return widget;
};

const isHelpButtonHidden = (width: number): boolean => {
  const widget = getWidget();
  return (
    /^none\b/.test(styleAt(widget, 'display', width) ?? '') ||
    /^hidden\b/.test(styleAt(widget, 'visibility', width) ?? '')
  );
};

interface TestDialogProps {
  open: boolean;
  keepMounted?: boolean;
}

const TestDialog: React.FC<TestDialogProps> = ({ open, keepMounted }) => (
  <Dialog open={open} keepMounted={keepMounted}>
    <DialogTitle>Add Multiple Contacts</DialogTitle>
  </Dialog>
);

const phone = 390;
const tablet = 768;
const allWidths = [phone, tablet, 1024, 1440];
const widerThanPhones = [tablet, 1024, 1440];

describe('helpjuice.css', () => {
  beforeEach(() => {
    // Helpjuice adds its widget straight into the body, with the trigger link inside it.
    const widget = document.createElement('div');
    widget.id = 'helpjuice-widget';
    widget.className = 'bottomRight';
    const trigger = document.createElement('a');
    trigger.id = 'helpjuice-widget-trigger';
    widget.appendChild(trigger);
    document.body.appendChild(widget);
  });

  afterEach(() => {
    getWidget().remove();
  });

  describe('while a dialog is open', () => {
    it.each(allWidths)('hides the help button at %ipx wide', async (width) => {
      const { findByRole } = render(<TestDialog open />);

      expect(await findByRole('dialog')).toBeInTheDocument();
      expect(isHelpButtonHidden(width)).toBe(true);
    });
  });

  describe('while no dialog is open', () => {
    it.each(allWidths)('shows the help button at %ipx wide', (width) => {
      expect(isHelpButtonHidden(width)).toBe(false);
    });

    it.each(allWidths)(
      'shows the help button at %ipx wide when a kept mounted dialog is closed',
      (width) => {
        render(<TestDialog open={false} keepMounted />);

        expect(document.querySelector('.MuiDialog-root')).toHaveClass(
          'MuiModal-hidden',
        );
        expect(isHelpButtonHidden(width)).toBe(false);
      },
    );

    it('shows the help button again after a kept mounted dialog closes', async () => {
      const { rerender } = render(<TestDialog open keepMounted />);
      expect(isHelpButtonHidden(tablet)).toBe(true);

      rerender(<TestDialog open={false} keepMounted />);

      // Only wait for MUI here. Checking the button inside waitFor would loop, because the
      // :has() stand-in changes attributes and waitFor reruns on every change.
      await waitFor(() =>
        expect(document.querySelector('.MuiDialog-root')).toHaveClass(
          'MuiModal-hidden',
        ),
      );
      expect(isHelpButtonHidden(tablet)).toBe(false);
    });
  });

  describe('button size', () => {
    const getTrigger = (): Element => {
      const trigger = document.getElementById('helpjuice-widget-trigger');
      if (!trigger) {
        throw new Error('The help trigger is missing');
      }
      return trigger;
    };

    it('uses the smaller 44px button on phones', () => {
      expect(styleAt(getWidget(), '--trigger-size', phone)).toBe('44px');
      expect(styleAt(getTrigger(), 'width', phone)).toBe(
        'var(--trigger-size) !important',
      );
      expect(styleAt(getTrigger(), 'height', phone)).toBe(
        'var(--trigger-size) !important',
      );
      expect(styleAt(getWidget(), 'bottom', phone)).not.toBe(
        '160px !important',
      );
    });

    it.each(widerThanPhones)(
      'keeps the regular button at %ipx wide',
      (width) => {
        expect(styleAt(getWidget(), '--trigger-size', width)).toBeUndefined();
        expect(styleAt(getTrigger(), 'width', width)).toBeUndefined();
        expect(styleAt(getTrigger(), 'height', width)).toBeUndefined();
        expect(styleAt(getWidget(), 'bottom', width)).toBe('160px !important');
      },
    );
  });
});
