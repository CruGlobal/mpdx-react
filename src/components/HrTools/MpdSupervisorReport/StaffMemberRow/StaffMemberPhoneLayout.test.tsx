import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import {
  desktopWidth,
  getGridColumnsAtWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import theme from 'src/theme';
import { RowDensityEnum } from '../MpdSupervisorReportContext';
import { buildQuarterChips } from '../helpers';
import { managedStaffMember } from '../mpdSupervisorReportMocks';
import { FiscalYearQuarters } from './FiscalYearQuarters';
import { StaffMember } from './StaffMember';

// MPDX-10302: at 390px the quarter chips overlapped the avatar and name.
// jsdom can't measure layout, so these read the CSS that applies at each width.

// Between MUI's sm (600) and md (900) breakpoints
const tabletWidth = 768;
// md, where the desktop layout starts, and a common desktop width
const desktopWidths = [900, desktopWidth];
const quarterLabel = /^FQ\d \d\d$/;

const member = managedStaffMember({ firstName: 'Brooke', lastName: 'Butler' });

const renderRow = (density: RowDensityEnum) =>
  render(
    <ThemeProvider theme={theme}>
      <StaffMember data={member} density={density} onClick={jest.fn()} />
    </ThemeProvider>,
  );

// Whether the element or any wrapper up to (not including) stop is display: none
const isHiddenAtWidth = (element: Element, stop: Element, width: number) => {
  let current: Element | null = element;
  while (current && current !== stop) {
    if (getStyleAtWidth(current, 'display', width) === 'none') {
      return true;
    }
    current = current.parentElement;
  }
  return false;
};

// The box between name and stop that keeps the name column from shrinking on desktop
const findMinWidthBox = (name: Element, stop: Element) => {
  let current: Element | null = name;
  while (current && current !== stop) {
    if (getStyleAtWidth(current, 'min-width', desktopWidth) === '200px') {
      return current;
    }
    current = current.parentElement;
  }
  return null;
};

const getRowParts = (name: HTMLElement, strip: HTMLElement) => {
  const nameItem = name.closest('.MuiGrid-root');
  const quarterItem = strip.closest('.MuiGrid-root');
  if (!nameItem || !quarterItem) {
    throw new Error('Row layout not found');
  }
  const nameBox = findMinWidthBox(name, nameItem);
  if (!nameBox) {
    throw new Error('Name box not found');
  }
  return { nameItem, quarterItem, nameBox };
};

describe.each([RowDensityEnum.Comfortable, RowDensityEnum.Compact])(
  'StaffMember phone layout (%s)',
  (density) => {
    it.each([phoneWidth, tabletWidth])(
      'stacks the balances under the name at %ipx',
      (width) => {
        const { getByText, getByTestId } = renderRow(density);
        const { nameItem, quarterItem, nameBox } = getRowParts(
          getByText('Brooke Butler'),
          getByTestId('balance-chips'),
        );

        expect(getGridColumnsAtWidth(nameItem, width)).toBe(12);
        expect(getGridColumnsAtWidth(quarterItem, width)).toBe(12);
        // A long name wraps instead of pushing past the card
        expect(getStyleAtWidth(nameBox, 'min-width', width)).not.toBe('200px');
        expect(getStyleAtWidth(quarterItem, 'margin-top', width)).toBe(
          density === RowDensityEnum.Compact ? '4px' : '8px',
        );
      },
    );

    it.each(desktopWidths)(
      'keeps the name and balances side by side at %ipx',
      (width) => {
        const { getByText, getByTestId } = renderRow(density);
        const { nameItem, quarterItem, nameBox } = getRowParts(
          getByText('Brooke Butler'),
          getByTestId('balance-chips'),
        );

        expect(getGridColumnsAtWidth(nameItem, width)).toBe(6);
        expect(getGridColumnsAtWidth(quarterItem, width)).toBe(6);
        expect(getStyleAtWidth(nameBox, 'min-width', width)).toBe('200px');
        expect(getStyleAtWidth(quarterItem, 'margin-top', width)).toBe('');
      },
    );
  },
);

// The drawer header, which is full width on phones
describe('FiscalYearQuarters', () => {
  const renderQuarters = () =>
    render(
      <ThemeProvider theme={theme}>
        <FiscalYearQuarters
          quarters={buildQuarterChips(member.quarterlyHealth)}
        />
      </ThemeProvider>,
    );

  it.each([
    [phoneWidth, 'repeat(2, minmax(0, 1fr))'],
    [tabletWidth, 'repeat(4, minmax(0, 1fr))'],
  ])('lays the quarters out as a grid at %ipx', (width, columns) => {
    const { getByTestId } = renderQuarters();
    const strip = getByTestId('quarter-chips');

    expect(getStyleAtWidth(strip, 'display', width)).toBe('grid');
    expect(getStyleAtWidth(strip, 'grid-template-columns', width)).toBe(
      columns,
    );
  });

  it.each([phoneWidth, tabletWidth])(
    'labels each quarter chip at %ipx',
    (width) => {
      const { getByTestId } = renderQuarters();
      const strip = getByTestId('quarter-chips');
      const captions = within(strip).getAllByText(quarterLabel);

      expect(captions.map((caption) => caption.textContent)).toEqual([
        'FQ3 26',
        'FQ2 26',
        'FQ1 26',
        'FQ4 25',
      ]);
      captions.forEach((caption) => {
        expect(isHiddenAtWidth(caption, strip, width)).toBe(false);
        // The chip already names its quarter and health for screen readers
        expect(caption).toHaveAttribute('aria-hidden', 'true');
      });
      expect(within(strip).getByText('FQ3 26, on track')).toBeInTheDocument();
    },
  );

  it.each(desktopWidths)(
    'keeps the chips in one row with the column headers labeling them at %ipx',
    (width) => {
      const { getByTestId } = renderQuarters();
      const strip = getByTestId('quarter-chips');

      expect(getStyleAtWidth(strip, 'display', width)).toBe('flex');
      expect(getStyleAtWidth(strip, 'flex-direction', width)).toBe('row');
      expect(getStyleAtWidth(strip, 'flex-wrap', width)).not.toBe('wrap');
      expect(getStyleAtWidth(strip, 'grid-template-columns', width)).toBe('');
      expect(strip.querySelectorAll('.MuiChip-root')).toHaveLength(4);
      within(strip)
        .getAllByText(quarterLabel)
        .forEach((caption) => {
          expect(isHiddenAtWidth(caption, strip, width)).toBe(true);
        });
    },
  );
});

describe('MonthEndBalances on the row', () => {
  it.each([phoneWidth, tabletWidth])(
    'labels each balance chip with its month at %ipx',
    (width) => {
      const { getByTestId } = renderRow(RowDensityEnum.Comfortable);
      const strip = getByTestId('balance-chips');
      const captions = within(strip).getAllByText(/^\w{3} \d{4}$/);

      expect(captions.map((caption) => caption.textContent)).toEqual([
        'Oct 2026',
        'Sep 2026',
        'Aug 2026',
        'Jul 2026',
      ]);
      captions.forEach((caption) => {
        expect(isHiddenAtWidth(caption, strip, width)).toBe(false);
        expect(caption).toHaveAttribute('aria-hidden', 'true');
      });
      expect(getStyleAtWidth(strip, 'display', width)).toBe('grid');
    },
  );

  it('hides the captions where the column headers label the chips', () => {
    const { getByTestId } = renderRow(RowDensityEnum.Comfortable);
    const strip = getByTestId('balance-chips');

    within(strip)
      .getAllByText(/^\w{3} \d{4}$/)
      .forEach((caption) => {
        expect(isHiddenAtWidth(caption, strip, desktopWidth)).toBe(true);
      });
  });
});
