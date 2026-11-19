import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import { HeaderTypeEnum } from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import theme from 'src/theme';
import { FourteenMonthReportCurrencyType } from '../../FourteenMonthReport';
import { FourteenMonthReportHeader } from './Header';

const title = 'test title';
const onExpandToggle = jest.fn();
const onNavListToggle = jest.fn();
const onPrint = jest.fn();

const reportTitle = 'Contributions by Partner Currency';

// Phone widths are below MUI's `sm` (600px) breakpoint
const phoneWidths = [phoneWidth, 599];
// Tablet widths sit between MUI's `sm` (600px) and `md` (900px) breakpoints
const tabletWidths = [600, 768, 899];
// Desktop widths are `md` (900px) and up
const desktopWidths = [900, desktopWidth];

const renderHeader = ({
  isMobile,
  isNavListOpen = false,
}: {
  isMobile: boolean;
  isNavListOpen?: boolean;
}) =>
  render(
    <ThemeProvider theme={theme}>
      <FourteenMonthReportHeader
        csvData={[]}
        currencyType={FourteenMonthReportCurrencyType.Donor}
        isExpanded={false}
        isMobile={isMobile}
        isNavListOpen={isNavListOpen}
        headerType={HeaderTypeEnum.Report}
        title={reportTitle}
        onExpandToggle={onExpandToggle}
        onNavListToggle={onNavListToggle}
        onPrint={onPrint}
      />
    </ThemeProvider>,
  );

// The header must be free to grow. A fixed height (or a max height) lets a
// second row of buttons spill out of the header and slide under the table.
const getHeaderSizeAtWidth = (header: HTMLElement, width: number) => ({
  height: getStyleAtWidth(header, 'height', width),
  maxHeight: getStyleAtWidth(header, 'max-height', width),
  minHeight: getStyleAtWidth(header, 'min-height', width),
});
const growingHeaderSize = { height: '', maxHeight: '', minHeight: '96px' };

// True when neither the element nor anything around it is hidden with
// display: none on a screen `width` pixels wide
const isShownAtWidth = (element: HTMLElement, width: number) => {
  for (let el: HTMLElement | null = element; el; el = el.parentElement) {
    if (getStyleAtWidth(el, 'display', width) === 'none') {
      return false;
    }
  }
  return true;
};

// The smallest box that holds both the title and the buttons
const findSharedRow = (heading: HTMLElement, buttons: HTMLElement) => {
  let el = buttons.parentElement;
  while (el && !el.contains(heading)) {
    el = el.parentElement;
  }
  if (!el) {
    throw new Error('No row holds both the title and the buttons');
  }
  return el;
};

describe('FourteenMonthReportHeader', () => {
  it('default', async () => {
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <FourteenMonthReportHeader
          csvData={[]}
          currencyType={FourteenMonthReportCurrencyType.Salary}
          isExpanded={true}
          isMobile={true}
          isNavListOpen={true}
          title={title}
          onExpandToggle={onExpandToggle}
          onNavListToggle={onNavListToggle}
          onPrint={onPrint}
        />
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(queryByTestId('FourteenMonthReportHeader')).toBeInTheDocument();
  });

  it('expand toggle event', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <FourteenMonthReportHeader
          csvData={[]}
          currencyType={FourteenMonthReportCurrencyType.Salary}
          isExpanded={true}
          isMobile={true}
          isNavListOpen={true}
          title={title}
          onExpandToggle={onExpandToggle}
          onNavListToggle={onNavListToggle}
          onPrint={onPrint}
        />
      </ThemeProvider>,
    );

    userEvent.click(getByRole('button', { hidden: true, name: 'Hide' }));
    expect(onExpandToggle).toHaveBeenCalled();
  });

  it('toggle nav list event', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <FourteenMonthReportHeader
          csvData={[]}
          currencyType={FourteenMonthReportCurrencyType.Salary}
          isExpanded={true}
          isMobile={true}
          isNavListOpen={true}
          headerType={HeaderTypeEnum.Report}
          title={title}
          onExpandToggle={onExpandToggle}
          onNavListToggle={onNavListToggle}
          onPrint={onPrint}
        />
      </ThemeProvider>,
    );

    userEvent.click(
      getByRole('button', { hidden: true, name: 'Toggle Navigation Panel' }),
    );
    expect(onNavListToggle).toHaveBeenCalled();
  });

  describe('on tablets', () => {
    it('shows the Expand Partner Info, Export and Print buttons in the header', () => {
      const { getByTestId } = renderHeader({ isMobile: false });
      const header = within(getByTestId('FourteenMonthReportHeader'));

      expect(
        header.getByRole('group', { name: 'Report header button group' }),
      ).toBeInTheDocument();
      expect(
        header.getByRole('button', { name: 'Expand Partner Info' }),
      ).toBeInTheDocument();
      expect(header.getByRole('link', { name: 'Export' })).toBeInTheDocument();
      expect(header.getByRole('button', { name: 'Print' })).toBeInTheDocument();
    });

    it.each(tabletWidths)(
      'lets the header grow to fit a second row at %ipx',
      (width) => {
        const { getByTestId } = renderHeader({ isMobile: false });

        expect(
          getHeaderSizeAtWidth(getByTestId('FourteenMonthReportHeader'), width),
        ).toEqual(growingHeaderSize);
      },
    );

    it.each(tabletWidths)(
      'lets the buttons wrap onto their own row under the title at %ipx',
      (width) => {
        const { getByRole } = renderHeader({ isMobile: false });
        const title = getByRole('heading', { name: reportTitle });
        const buttonGroup = getByRole('group', {
          name: 'Report header button group',
        });
        const row = findSharedRow(title, buttonGroup);

        expect(getStyleAtWidth(row, 'display', width)).toBe('flex');
        expect(getStyleAtWidth(row, 'flex-wrap', width)).toBe('wrap');
        expect(isShownAtWidth(buttonGroup, width)).toBe(true);
      },
    );
  });

  describe('on desktop', () => {
    // With the Reports menu open the report is narrow enough that the
    // buttons can wrap under the title even on a wide screen
    it.each(desktopWidths)(
      'lets the header grow to fit a second row with the Reports menu open at %ipx',
      (width) => {
        const { getByTestId, getByRole } = renderHeader({
          isMobile: false,
          isNavListOpen: true,
        });
        const buttonGroup = getByRole('group', {
          name: 'Report header button group',
        });

        expect(
          getHeaderSizeAtWidth(getByTestId('FourteenMonthReportHeader'), width),
        ).toEqual(growingHeaderSize);
        expect(isShownAtWidth(buttonGroup, width)).toBe(true);
      },
    );
  });

  describe('on phones', () => {
    it('shows the short Expand label with the Export and Print buttons', () => {
      const { getByTestId } = renderHeader({ isMobile: true });
      const header = within(getByTestId('FourteenMonthReportHeader'));

      expect(
        header.getByRole('button', { name: 'Expand' }),
      ).toBeInTheDocument();
      expect(header.queryByText(/Partner Info/)).not.toBeInTheDocument();
      expect(header.getByRole('link', { name: 'Export' })).toBeInTheDocument();
      expect(header.getByRole('button', { name: 'Print' })).toBeInTheDocument();
    });

    it.each(phoneWidths)(
      'lets the header grow to fit a second row at %ipx',
      (width) => {
        const { getByTestId } = renderHeader({ isMobile: true });

        expect(
          getHeaderSizeAtWidth(getByTestId('FourteenMonthReportHeader'), width),
        ).toEqual(growingHeaderSize);
      },
    );
  });
});
