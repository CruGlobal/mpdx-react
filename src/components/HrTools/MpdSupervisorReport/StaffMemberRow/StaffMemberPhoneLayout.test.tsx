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
import { FiscalYearQuarters, StaffMember } from './StaffMember';

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

const getRowParts = (name: HTMLElement, strip: HTMLElement) => {
  const nameItem = name.closest('.MuiGrid-root');
  const quarterItem = strip.closest('.MuiGrid-root');
  // The box that keeps the name column from shrinking on desktop
  let nameBox: Element | null = name;
  while (
    nameBox &&
    nameBox !== nameItem &&
    getStyleAtWidth(nameBox, 'min-width', desktopWidth) !== '200px'
  ) {
    nameBox = nameBox.parentElement;
  }
  if (!nameItem || !quarterItem || !nameBox || nameBox === nameItem) {
    throw new Error('Row layout not found');
  }
  return { nameItem, quarterItem, nameBox };
};

describe.each([RowDensityEnum.Comfortable, RowDensityEnum.Compact])(
  'StaffMember phone layout (%s)',
  (density) => {
    it.each([phoneWidth, tabletWidth])(
      'stacks the quarters under the name at %ipx',
      (width) => {
        const { getByText, getByTestId } = renderRow(density);
        const { nameItem, quarterItem, nameBox } = getRowParts(
          getByText('Brooke Butler'),
          getByTestId('quarter-chips'),
        );

        expect(getGridColumnsAtWidth(nameItem, width)).toBe(12);
        expect(getGridColumnsAtWidth(quarterItem, width)).toBe(12);
        // A long name wraps instead of pushing past the card
        expect(getStyleAtWidth(nameBox, 'min-width', width)).not.toBe('200px');
      },
    );

    it.each(desktopWidths)(
      'keeps the name and quarters side by side at %ipx',
      (width) => {
        const { getByText, getByTestId } = renderRow(density);
        const { nameItem, quarterItem, nameBox } = getRowParts(
          getByText('Brooke Butler'),
          getByTestId('quarter-chips'),
        );

        expect(getGridColumnsAtWidth(nameItem, width)).toBe(6);
        expect(getGridColumnsAtWidth(quarterItem, width)).toBe(6);
        expect(getStyleAtWidth(nameBox, 'min-width', width)).toBe('200px');
        expect(getStyleAtWidth(quarterItem, 'margin-top', width)).toBe('');
      },
    );
  },
);

// Shared by the row and the drawer header, which is full width on phones
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
    'keeps the old single row of chips at %ipx',
    (width) => {
      const { getByTestId } = renderQuarters();
      const strip = getByTestId('quarter-chips');
      const chips = Array.from(strip.querySelectorAll('.MuiChip-root'));

      expect(getStyleAtWidth(strip, 'display', width)).toBe('flex');
      expect(getStyleAtWidth(strip, 'flex-direction', width)).toBe('row');
      expect(getStyleAtWidth(strip, 'gap', width)).toBe('');
      // The spacing the old Stack spacing={2} put on every chip after the first
      expect(
        chips.map((chip) => getStyleAtWidth(chip, 'margin-left', width)),
      ).toEqual(['', '16px', '16px', '16px']);
      chips.forEach((chip) => {
        expect(getStyleAtWidth(chip, 'min-width', width)).toBe('80px');
        expect(getStyleAtWidth(chip.parentElement!, 'display', width)).toBe(
          'contents',
        );
      });
      within(strip)
        .getAllByText(quarterLabel)
        .forEach((caption) => {
          expect(isHiddenAtWidth(caption, strip, width)).toBe(true);
        });
    },
  );
});
