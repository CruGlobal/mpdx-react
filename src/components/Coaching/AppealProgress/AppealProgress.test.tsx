import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import theme from 'src/theme';
import { AppealProgress } from './AppealProgress';

const desktopWidths = [600, 900, desktopWidth];

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

describe('AppealProgress', () => {
  it('has correct defaults', () => {
    const { getByTestId, queryByTestId } = render(<AppealProgress isPrimary />);
    expect(queryByTestId('styledProgressLoading')).toBeNull();
    expect(getByTestId('styledProgressPrimary')).toHaveStyle('width: 0%;');
    expect(getByTestId('styledProgressSecondary')).toHaveStyle('width: 0%;');
  });

  it('has correct overrides', () => {
    const { getByTestId, queryByTestId } = render(
      <AppealProgress isPrimary goal={1} received={0.5} pledged={0.75} />,
    );
    expect(queryByTestId('styledProgressLoading')).toBeNull();
    expect(getByTestId('styledProgressPrimary')).toHaveStyle('width: 50%;');
    expect(getByTestId('styledProgressSecondary')).toHaveStyle('width: 75%;');
  });

  it('allows loading', () => {
    const { getByTestId, queryByTestId } = render(
      <AppealProgress loading isPrimary />,
    );
    expect(getByTestId('styledProgressLoading')).toBeTruthy();
    expect(queryByTestId('styledProgressPrimary')).toBeNull();
    expect(queryByTestId('styledProgressSecondary')).toBeNull();
  });

  describe('label row', () => {
    const renderLabelRow = (isPrimary = true) => {
      const utils = render(
        <ThemeProvider theme={theme}>
          <AppealProgress
            isPrimary={isPrimary}
            goal={1000}
            received={1108.81}
            pledged={1200}
          />
        </ThemeProvider>,
      );
      const goalLabel = utils.getByText(
        isPrimary ? 'Primary Appeal $1,000' : 'Monthly $1,000',
      );
      const row = goalLabel.parentElement as HTMLElement;
      const values = row.lastElementChild as HTMLElement;
      return { ...utils, goalLabel, row, values };
    };

    it('shows the primary goal first and the values after it', () => {
      const { goalLabel, row, values } = renderLabelRow();

      expect(row.children).toHaveLength(2);
      expect(row.firstElementChild).toBe(goalLabel);
      expect(values).toHaveTextContent('$1,108.81 (111%) / $1,200 (120%)');
    });

    it('shows the monthly goal when the appeal is not primary', () => {
      const { goalLabel, queryByText, values } = renderLabelRow(false);

      expect(goalLabel).toBeInTheDocument();
      expect(queryByText(/Primary Appeal/)).not.toBeInTheDocument();
      expect(values).toHaveTextContent('$1,108.81 (111%) / $1,200 (120%)');
    });

    it('puts the progress bar below the goal and values', () => {
      const { row, getByTestId } = renderLabelRow();

      expect(row.nextElementSibling).toContainElement(
        getByTestId('styledProgressPrimary'),
      );
    });

    describe('on phones', () => {
      it.each([true, false])(
        'stacks the goal above the values in a centered column (primary: %s)',
        (isPrimary) => {
          const { row } = renderLabelRow(isPrimary);

          expect(getStyleAtWidth(row, 'display', phoneWidth)).toBe('flex');
          expect(getStyleAtWidth(row, 'flex-direction', phoneWidth)).toBe(
            'column',
          );
          expect(getStyleAtWidth(row, 'align-items', phoneWidth)).toBe(
            'center',
          );
        },
      );

      it('centers the goal and values text', () => {
        const { goalLabel, values } = renderLabelRow();

        expect(textAlignAtWidth(goalLabel, phoneWidth)).toBe('center');
        expect(textAlignAtWidth(values, phoneWidth)).toBe('center');
      });

      it('does not push the values to one side', () => {
        const { values } = renderLabelRow();

        expect(getStyleAtWidth(values, 'margin-left', phoneWidth)).not.toBe(
          'auto',
        );
        expect(getStyleAtWidth(values, 'margin-right', phoneWidth)).not.toBe(
          'auto',
        );
      });
    });

    describe.each(desktopWidths)('at %ipx', (width) => {
      it('keeps the goal and values on one line with a gap', () => {
        const { row } = renderLabelRow();
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

      it('does not center or right-align the label text', () => {
        const { goalLabel, values } = renderLabelRow();

        expect(['center', 'right']).not.toContain(
          textAlignAtWidth(goalLabel, width),
        );
        expect(['center', 'right']).not.toContain(
          textAlignAtWidth(values, width),
        );
      });
    });
  });

  describe('long values', () => {
    const renderLongValues = () => {
      const utils = render(
        <ThemeProvider theme={theme}>
          <AppealProgress
            isPrimary
            goal={100000}
            received={111891.28}
            pledged={211891.28}
          />
        </ThemeProvider>,
      );
      const goalLabel = utils.getByText('Primary Appeal $100,000');
      const values = goalLabel.parentElement?.lastElementChild as HTMLElement;
      const received = utils.getByLabelText('Received');
      const committed = utils.getByLabelText('Committed');
      return { ...utils, values, received, committed };
    };

    it('keeps each amount with its percentage', () => {
      const { values, received, committed } = renderLongValues();

      expect(received.textContent).toBe('$111,891.28 (112%)');
      expect(committed.textContent).toBe('$211,891.28 (212%)');
      expect(values).toContainElement(received);
      expect(values).toContainElement(committed);
      expect(values.textContent).toBe(
        '$111,891.28 (112%) / $211,891.28 (212%)',
      );
    });

    it('centers the long values line on phones', () => {
      const { values } = renderLongValues();

      expect(textAlignAtWidth(values, phoneWidth)).toBe('center');
    });

    it('only wraps long values at the slash on phones', () => {
      const { received, committed } = renderLongValues();

      expect(getStyleAtWidth(received, 'white-space', phoneWidth)).toBe(
        'nowrap',
      );
      expect(getStyleAtWidth(committed, 'white-space', phoneWidth)).toBe(
        'nowrap',
      );
    });

    it.each(desktopWidths)(
      'does not apply the phone-only styles at %ipx',
      (width) => {
        const { values, received, committed } = renderLongValues();

        expect(['center', 'right']).not.toContain(
          textAlignAtWidth(values, width),
        );
        expect(getStyleAtWidth(received, 'white-space', width)).not.toBe(
          'nowrap',
        );
        expect(getStyleAtWidth(committed, 'white-space', width)).not.toBe(
          'nowrap',
        );
      },
    );
  });
});
