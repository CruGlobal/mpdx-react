import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestWrapper from '__tests__/util/TestWrapper';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import theme from '../../../../theme';
import Appeal from './Appeal';

const appeal = {
  name: 'test 123',
  id: '',
  amount: 100,
  amountCurrency: 'CAD',
  pledgesAmountProcessed: 10,
  pledgesAmountReceivedNotProcessed: 20,
  pledgesAmountNotReceivedNotProcessed: 30,
};

const desktopWidths = [600, 900, desktopWidth];

// jsdom keeps the flex shorthand as written, so read flex-shrink out of it
const flexShrinkAtWidth = (element: Element, width: number): number => {
  const shrink = getStyleAtWidth(element, 'flex-shrink', width);
  if (shrink) {
    return Number(shrink);
  }
  const flex = getStyleAtWidth(element, 'flex', width);
  if (flex === 'none') {
    return 0;
  }
  const [, flexShrink] = flex.split(/\s+/);
  return flexShrink && !Number.isNaN(Number(flexShrink))
    ? Number(flexShrink)
    : 1;
};

// text-align is inherited, so use the value from the closest element that sets it
const textAlignAtWidth = (element: Element, width: number): string => {
  for (
    let current: Element | null = element;
    current;
    current = current.parentElement
  ) {
    const value = getStyleAtWidth(current, 'text-align', width);
    if (value && value !== 'inherit') {
      return value;
    }
  }
  return 'start';
};

describe('AppealTest', () => {
  it('regular', () => {
    const changePrimary = jest.fn();
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <Appeal
            appeal={appeal}
            primary={false}
            changePrimary={changePrimary}
          />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(getByText('test 123')).toBeInTheDocument();
    expect(getByText('CA$10.00 / CA$100.00')).toBeInTheDocument();
    expect(getByText('CA$10 (10%)')).toBeInTheDocument();
    expect(getByText('CA$20 (20%)')).toBeInTheDocument();
    expect(getByText('CA$30 (30%)')).toBeInTheDocument();
  });

  describe('card header', () => {
    const renderHeader = (primary = false) => {
      const utils = render(
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <Appeal
              appeal={appeal}
              primary={primary}
              changePrimary={jest.fn()}
            />
          </TestWrapper>
        </ThemeProvider>,
      );
      const name = utils.getByRole('link', { name: 'test 123' })
        .parentElement as HTMLElement;
      const row = name.parentElement as HTMLElement;
      const amounts = utils.getByText('CA$10.00 / CA$100.00');
      const amountGroup = amounts.parentElement as HTMLElement;
      const star = utils.getByRole('button', { name: 'Primary Icon' });
      const progressValues = utils.getByText('CA$10 (10%)')
        .parentElement as HTMLElement;
      return {
        ...utils,
        name,
        row,
        amounts,
        amountGroup,
        star,
        progressValues,
      };
    };

    it('puts the name first and the amounts and star together after it', () => {
      const { name, row, amountGroup, star } = renderHeader();

      expect(row.children).toHaveLength(2);
      expect(row.firstElementChild).toBe(name);
      expect(row.lastElementChild).toBe(amountGroup);
      expect(amountGroup).toContainElement(star);
    });

    it('shows the filled star for the primary appeal', () => {
      const { amountGroup, queryByTestId, star } = renderHeader(true);

      expect(amountGroup).toContainElement(star);
      expect(queryByTestId('setPrimary-')).not.toBeInTheDocument();
    });

    it('puts the progress values and bar below the name and amounts', () => {
      const { row, progressValues } = renderHeader();

      expect(row.nextElementSibling).toBe(progressValues);
      expect(progressValues).toHaveTextContent(
        'CA$10 (10%)/CA$20 (20%)/CA$30 (30%)',
      );
    });

    describe('on phones', () => {
      it('stacks the name above the amounts in a centered column', () => {
        const { row } = renderHeader();

        expect(getStyleAtWidth(row, 'display', phoneWidth)).toBe('flex');
        expect(getStyleAtWidth(row, 'flex-direction', phoneWidth)).toBe(
          'column',
        );
        expect(getStyleAtWidth(row, 'align-items', phoneWidth)).toBe('center');
      });

      it('centers the name and amounts text', () => {
        const { name, amounts } = renderHeader();

        expect(textAlignAtWidth(name, phoneWidth)).toBe('center');
        expect(textAlignAtWidth(amounts, phoneWidth)).toBe('center');
      });

      it('does not push the amounts and star to one side', () => {
        const { amountGroup } = renderHeader();

        expect(
          getStyleAtWidth(amountGroup, 'margin-left', phoneWidth),
        ).not.toBe('auto');
        expect(
          getStyleAtWidth(amountGroup, 'margin-right', phoneWidth),
        ).not.toBe('auto');
      });

      it('centers the amounts and star as one row', () => {
        const { amountGroup } = renderHeader();

        expect(getStyleAtWidth(amountGroup, 'display', phoneWidth)).toBe(
          'flex',
        );
        expect(
          getStyleAtWidth(amountGroup, 'justify-content', phoneWidth),
        ).toBe('center');
      });

      it('centers the star vertically with the amounts', () => {
        const { amountGroup, star } = renderHeader();

        expect(getStyleAtWidth(amountGroup, 'align-items', phoneWidth)).toBe(
          'center',
        );
        expect(
          parseFloat(getStyleAtWidth(star, 'margin-top', phoneWidth) || '0'),
        ).toBe(0);
      });

      it('centers the given, received, and committed values above the bar', () => {
        const { progressValues } = renderHeader();

        expect(getStyleAtWidth(progressValues, 'display', phoneWidth)).toBe(
          'flex',
        );
        expect(
          getStyleAtWidth(progressValues, 'justify-content', phoneWidth),
        ).toBe('center');
      });
    });

    describe.each(desktopWidths)('at %ipx', (width) => {
      it('keeps the name and amounts on one line with a gap', () => {
        const { row } = renderHeader();
        const gap =
          getStyleAtWidth(row, 'column-gap', width) ||
          getStyleAtWidth(row, 'gap', width);

        expect(getStyleAtWidth(row, 'display', width)).toBe('flex');
        expect(getStyleAtWidth(row, 'flex-direction', width) || 'row').toBe(
          'row',
        );
        expect(getStyleAtWidth(row, 'justify-content', width)).toBe(
          'space-between',
        );
        expect(getStyleAtWidth(row, 'flex-wrap', width) || 'nowrap').toBe(
          'nowrap',
        );
        expect(getStyleAtWidth(row, 'align-items', width) || 'stretch').toBe(
          'stretch',
        );
        expect(parseFloat(gap || '0')).toBeGreaterThan(0);
      });

      it('does not center or right-align the header text', () => {
        const { name, amounts } = renderHeader();

        expect(['center', 'right']).not.toContain(
          textAlignAtWidth(name, width),
        );
        expect(['center', 'right']).not.toContain(
          textAlignAtWidth(amounts, width),
        );
      });

      it('keeps the amounts and star as a plain block', () => {
        const { amountGroup } = renderHeader();

        expect(getStyleAtWidth(amountGroup, 'display', width) || 'block').toBe(
          'block',
        );
      });

      it('keeps the star raised to line up with the amounts', () => {
        const { star } = renderHeader();

        expect(getStyleAtWidth(star, 'margin-top', width)).toBe('-6px');
      });

      it('right-aligns the given, received, and committed values', () => {
        const { progressValues } = renderHeader();

        expect(['end', 'flex-end']).toContain(
          getStyleAtWidth(progressValues, 'justify-content', width),
        );
      });
    });
  });

  describe('long amounts', () => {
    const longAppeal = {
      ...appeal,
      amount: 250000,
      amountCurrency: 'USD',
      pledgesAmountProcessed: 100000,
    };

    const renderLongAmounts = () => {
      const utils = render(
        <ThemeProvider theme={theme}>
          <TestWrapper>
            <Appeal appeal={longAppeal} changePrimary={jest.fn()} />
          </TestWrapper>
        </ThemeProvider>,
      );
      const amounts = utils.getByText('$100,000.00 / $250,000.00');
      const amountGroup = amounts.parentElement as HTMLElement;
      const star = utils.getByRole('button', { name: 'Primary Icon' });
      return { ...utils, amounts, amountGroup, star };
    };

    it('only leaves room to break the amounts at the slash', () => {
      const { amounts } = renderLongAmounts();
      const pieces = (amounts.textContent ?? '').split(' / ');

      expect(pieces).toEqual(['$100,000.00', '$250,000.00']);
      pieces.forEach((piece) => expect(piece).not.toMatch(/\s/));
    });

    it('keeps the amounts and star in one row with the star last on phones', () => {
      const { amounts, amountGroup, star } = renderLongAmounts();

      expect(getStyleAtWidth(amountGroup, 'display', phoneWidth)).toBe('flex');
      expect(
        getStyleAtWidth(amountGroup, 'flex-direction', phoneWidth) || 'row',
      ).toBe('row');
      expect(
        getStyleAtWidth(amountGroup, 'flex-wrap', phoneWidth) || 'nowrap',
      ).toBe('nowrap');
      expect(amountGroup.firstElementChild).toBe(amounts);
      expect(amountGroup.lastElementChild).toBe(star);
    });

    it('never shrinks the star on phones', () => {
      const { star } = renderLongAmounts();

      expect(flexShrinkAtWidth(star, phoneWidth)).toBe(0);
    });

    it('lets the amounts shrink and wrap centered beside the star on phones', () => {
      const { amounts } = renderLongAmounts();

      expect(
        parseFloat(getStyleAtWidth(amounts, 'min-width', phoneWidth)),
      ).toBe(0);
      expect(textAlignAtWidth(amounts, phoneWidth)).toBe('center');
    });
  });
});
