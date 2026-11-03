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

    it('shows the primary goal on the left and the values on the right', () => {
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

    it.each([phoneWidth, ...desktopWidths])(
      'keeps a gap between the goal and the values at %ipx',
      (width) => {
        const { row } = renderLabelRow();
        const gap =
          getStyleAtWidth(row, 'column-gap', width) ||
          getStyleAtWidth(row, 'gap', width);

        expect(parseFloat(gap || '0')).toBeGreaterThan(0);
      },
    );

    it('lets the values wrap onto their own line on phones', () => {
      const { row } = renderLabelRow();

      expect(getStyleAtWidth(row, 'display', phoneWidth)).toBe('flex');
      expect(getStyleAtWidth(row, 'flex-wrap', phoneWidth)).toBe('wrap');
    });

    it.each([phoneWidth, ...desktopWidths])(
      'pushes the values to the end of the row at %ipx',
      (width) => {
        const { values } = renderLabelRow();

        expect(getStyleAtWidth(values, 'margin-left', width)).toBe('auto');
      },
    );

    it.each(desktopWidths)(
      'keeps the label row on one line at %ipx',
      (width) => {
        const { row } = renderLabelRow();

        expect(getStyleAtWidth(row, 'display', width)).toBe('flex');
        expect(getStyleAtWidth(row, 'justify-content', width)).toBe(
          'space-between',
        );
        expect(getStyleAtWidth(row, 'flex-wrap', width) || 'nowrap').toBe(
          'nowrap',
        );
      },
    );
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

    it('right-aligns the values line on phones', () => {
      const { values } = renderLongValues();

      expect(getStyleAtWidth(values, 'text-align', phoneWidth)).toBe('right');
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

        expect(getStyleAtWidth(values, 'text-align', width)).not.toBe('right');
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
