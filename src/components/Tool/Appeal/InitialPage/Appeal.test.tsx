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
      return { ...utils, name, row, amounts, amountGroup, star };
    };

    it('puts the name on the left and the amounts and star together on the right', () => {
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

    it.each([phoneWidth, ...desktopWidths])(
      'keeps a gap between the name and the amounts at %ipx',
      (width) => {
        const { row } = renderHeader();
        const gap =
          getStyleAtWidth(row, 'column-gap', width) ||
          getStyleAtWidth(row, 'gap', width);

        expect(parseFloat(gap || '0')).toBeGreaterThan(0);
      },
    );

    it('lets the header wrap on phones', () => {
      const { row } = renderHeader();

      expect(getStyleAtWidth(row, 'display', phoneWidth)).toBe('flex');
      expect(getStyleAtWidth(row, 'flex-wrap', phoneWidth)).toBe('wrap');
    });

    it.each([phoneWidth, ...desktopWidths])(
      'pushes the amounts and star to the end of the row at %ipx',
      (width) => {
        const { amountGroup } = renderHeader();

        expect(getStyleAtWidth(amountGroup, 'margin-left', width)).toBe('auto');
      },
    );

    it.each(desktopWidths)('keeps the header on one line at %ipx', (width) => {
      const { row } = renderHeader();

      expect(getStyleAtWidth(row, 'display', width)).toBe('flex');
      expect(getStyleAtWidth(row, 'justify-content', width)).toBe(
        'space-between',
      );
      expect(getStyleAtWidth(row, 'flex-wrap', width) || 'nowrap').toBe(
        'nowrap',
      );
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

    it('lines the star up with the top of the amounts on phones', () => {
      const { amountGroup } = renderLongAmounts();

      expect(getStyleAtWidth(amountGroup, 'align-items', phoneWidth)).toBe(
        'flex-start',
      );
    });

    it('lets the amounts shrink and wrap right-aligned on phones', () => {
      const { amounts } = renderLongAmounts();

      expect(
        parseFloat(getStyleAtWidth(amounts, 'min-width', phoneWidth)),
      ).toBe(0);
      expect(getStyleAtWidth(amounts, 'text-align', phoneWidth)).toBe('right');
    });

    it.each(desktopWidths)(
      'keeps the amounts and star as a plain block at %ipx',
      (width) => {
        const { amounts, amountGroup } = renderLongAmounts();

        expect(getStyleAtWidth(amountGroup, 'display', width) || 'block').toBe(
          'block',
        );
        expect(getStyleAtWidth(amounts, 'text-align', width)).not.toBe('right');
      },
    );
  });
});
