import React from 'react';
import { Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import { TestSetupProvider } from 'src/components/Setup/SetupProvider';
import theme from 'src/theme';
import {
  HeaderTypeEnum,
  MultiPageHeader,
  multiPageHeaderHeight,
} from './MultiPageHeader';

const totalBalance = 'CA111';
const title = 'test title';
const onNavListToggle = jest.fn();

interface TestComponentProps {
  headerType?: HeaderTypeEnum;
  noRightExtra?: boolean;
  onSetupTour?: boolean;
  headerTitle?: string;
  rightExtra?: React.ReactNode;
}

const TestComponent: React.FC<TestComponentProps> = ({
  headerType = HeaderTypeEnum.Report,
  noRightExtra = false,
  onSetupTour,
  headerTitle = title,
  rightExtra = totalBalance,
}) => (
  <ThemeProvider theme={theme}>
    <TestSetupProvider onSetupTour={onSetupTour}>
      <MultiPageHeader
        isNavListOpen={true}
        title={headerTitle}
        onNavListToggle={onNavListToggle}
        rightExtra={noRightExtra ? undefined : rightExtra}
        headerType={headerType}
      />
    </TestSetupProvider>
  </ThemeProvider>
);

// One of the titles the ticket saw cut off on phones
const longTitle = 'Paid with Designation Support Goal Calculator';

const renderHeader = (props: TestComponentProps = {}) => {
  const utils = render(
    <TestComponent
      headerTitle={longTitle}
      rightExtra={<Button>Print</Button>}
      {...props}
    />,
  );
  const menuButton = utils.getByRole('button', {
    name: 'Toggle Navigation Panel',
  });
  const header = menuButton.closest('[test-dataid="MultiPageHeader"]');
  if (!header) {
    throw new Error('Header not found');
  }

  return {
    ...utils,
    header,
    menuButton,
    titleText: utils.getByRole('heading', { name: longTitle }),
  };
};

// The box that actually lays an element out, skipping display: contents wrappers
const layoutParentAtWidth = (element: Element, width: number): Element => {
  let parent = element.parentElement;
  while (parent && getStyleAtWidth(parent, 'display', width) === 'contents') {
    parent = parent.parentElement;
  }
  if (!parent) {
    throw new Error('Element has no layout parent');
  }
  return parent;
};

// The child of the row that holds the element
const rowChildHolding = (row: Element, element: Element): Element => {
  const child = Array.from(row.children).find((rowChild) =>
    rowChild.contains(element),
  );
  if (!child) {
    throw new Error('Element is not in the row');
  }
  return child;
};

// The element and each wrapper around it, up to and including the header
const selfAndWrappers = (element: Element, header: Element): Element[] => {
  const elements: Element[] = [];
  let current: Element | null = element;
  while (current) {
    elements.push(current);
    if (current === header) {
      break;
    }
    current = current.parentElement;
  }
  return elements;
};

const pxValue = (value: string): number => Number.parseFloat(value) || 0;

describe('MultiPageHeader', () => {
  it('default', async () => {
    const { getByRole, getByText } = render(<TestComponent />);

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText('CA111')).toBeInTheDocument();
    userEvent.click(
      getByRole('button', { hidden: true, name: 'Toggle Navigation Panel' }),
    );
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  });

  it('should not render rightExtra if undefined', async () => {
    const { queryByText } = render(<TestComponent noRightExtra />);

    expect(queryByText('CA111')).not.toBeInTheDocument();
  });

  it('should render the Reports menu', async () => {
    const { getByTestId, getByText } = render(
      <TestComponent headerType={HeaderTypeEnum.Report} />,
    );

    expect(getByText('Toggle Navigation Panel')).toBeInTheDocument();
    expect(getByTestId('ReportsMenuIcon')).toBeInTheDocument();
  });

  it('should render the HR Tools menu', async () => {
    const { getByTestId, getByText } = render(
      <TestComponent headerType={HeaderTypeEnum.HrTools} />,
    );

    expect(getByText('Toggle HR Tools Menu')).toBeInTheDocument();
    expect(getByTestId('HrToolsMenuIcon')).toBeInTheDocument();
  });

  it('should render the Settings menu when not on setup tour', async () => {
    const { getByRole } = render(
      <TestComponent headerType={HeaderTypeEnum.Settings} />,
    );

    expect(
      getByRole('button', { name: 'Toggle Preferences Menu' }),
    ).toBeInTheDocument();
  });

  it('should not render the Settings NavListButton during the setup tour', async () => {
    // queryByRole used here instead of getByRole to check for absence of NavListButton
    const { queryByRole } = render(
      <TestComponent headerType={HeaderTypeEnum.Settings} onSetupTour />,
    );

    expect(
      queryByRole('button', { name: 'Toggle Preferences Menu' }),
    ).not.toBeInTheDocument();
  });

  it('should render the MPDX Tools menu', async () => {
    const { getByTestId, getByText } = render(
      <TestComponent headerType={HeaderTypeEnum.MpdxTools} />,
    );

    expect(getByText('Toggle MPDX Tools Menu')).toBeInTheDocument();
    expect(getByTestId('MpdxToolsMenuIcon')).toBeInTheDocument();
  });

  // jsdom can't measure layout, so these read the CSS that applies at each width
  describe('layout', () => {
    it('shows the whole title on phones instead of cutting it off', () => {
      const { header, titleText } = renderHeader();

      expect(getStyleAtWidth(titleText, 'text-overflow', phoneWidth)).not.toBe(
        'ellipsis',
      );
      // A long title can only wrap if nothing around it forces one line or
      // hides what spills over
      const wrappers = selfAndWrappers(titleText, header);
      expect(
        wrappers.filter(
          (element) =>
            getStyleAtWidth(element, 'white-space', phoneWidth) === 'nowrap',
        ),
      ).toEqual([]);
      expect(
        wrappers.filter(
          (element) =>
            getStyleAtWidth(element, 'overflow', phoneWidth) === 'hidden',
        ),
      ).toEqual([]);
    });

    it('uses the smaller h6 title size on phones', () => {
      const { titleText } = renderHeader();

      expect(getStyleAtWidth(titleText, 'font-size', phoneWidth)).toBe(
        theme.typography.h6.fontSize,
      );
    });

    it('moves the extras to their own full-width row under the title on phones', () => {
      const { menuButton, titleText, getByRole } = renderHeader();
      const extra = getByRole('button', { name: 'Print' });

      const headerRow = layoutParentAtWidth(menuButton, phoneWidth);
      expect(getStyleAtWidth(headerRow, 'display', phoneWidth)).toBe('flex');
      expect(getStyleAtWidth(headerRow, 'flex-wrap', phoneWidth)).toBe('wrap');

      const extrasRow = rowChildHolding(headerRow, extra);
      expect(extrasRow).not.toContainElement(titleText);
      expect(getStyleAtWidth(extrasRow, 'display', phoneWidth)).not.toBe(
        'contents',
      );
      // A full-width item can't share a line, so it wraps onto its own row
      expect([
        getStyleAtWidth(extrasRow, 'flex-basis', phoneWidth),
        getStyleAtWidth(extrasRow, 'width', phoneWidth),
      ]).toContain('100%');
      // The row comes after the title, and no CSS order moves it above
      expect(
        titleText.compareDocumentPosition(extra) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(getStyleAtWidth(extrasRow, 'order', phoneWidth)).toBe('');
    });

    it('lines the extras row up with the title on phones', () => {
      const { menuButton, getByRole } = renderHeader();
      const extra = getByRole('button', { name: 'Print' });

      const headerRow = layoutParentAtWidth(menuButton, phoneWidth);
      const extrasRow = rowChildHolding(headerRow, extra);
      // The title starts just past the menu button and the space after it
      const titleStart =
        pxValue(getStyleAtWidth(menuButton, 'width', phoneWidth)) +
        pxValue(getStyleAtWidth(menuButton, 'margin-right', phoneWidth));
      const extrasStart =
        pxValue(getStyleAtWidth(extrasRow, 'padding-left', phoneWidth)) +
        pxValue(getStyleAtWidth(extrasRow, 'margin-left', phoneWidth));
      expect(titleStart).toBeGreaterThan(0);
      expect(extrasStart).toBe(titleStart);
    });

    it('leaves no empty row on phones when the extras show nothing', () => {
      const NothingToShow: React.FC = () => null;
      const { menuButton, titleText } = renderHeader({
        rightExtra: <NothingToShow />,
      });

      const headerRow = layoutParentAtWidth(menuButton, phoneWidth);
      const shownBesideTitle = Array.from(headerRow.children).filter(
        (child) =>
          !child.contains(menuButton) &&
          !child.contains(titleText) &&
          getStyleAtWidth(child, 'display', phoneWidth) !== 'none',
      );
      expect(shownBesideTitle).toEqual([]);
    });

    it('lets the header grow on phones to fit a wrapped title and the extras row', () => {
      const { header } = renderHeader();

      // An unset height falls back to auto
      expect(getStyleAtWidth(header, 'height', phoneWidth) || 'auto').toBe(
        'auto',
      );
    });

    it.each([600, 900, desktopWidth])(
      'keeps the fixed 80px header with everything on one row at %ipx wide',
      (width) => {
        const { header, menuButton, getByRole } = renderHeader();
        const extra = getByRole('button', { name: 'Print' });

        expect(getStyleAtWidth(header, 'height', width)).toBe('80px');
        const headerRow = layoutParentAtWidth(menuButton, width);
        expect(getStyleAtWidth(headerRow, 'flex-wrap', width) || 'nowrap').toBe(
          'nowrap',
        );
        // The extras sit in the same row as the title, as they did before
        expect(layoutParentAtWidth(extra, width)).toBe(headerRow);
      },
    );

    it.each([600, 900, desktopWidth])(
      'keeps the h5 title size at %ipx wide',
      (width) => {
        const { titleText } = renderHeader();

        expect(getStyleAtWidth(titleText, 'font-size', width)).toBe(
          theme.typography.h5.fontSize,
        );
      },
    );
  });

  describe('header height for the content below it', () => {
    const { ResizeObserver: originalResizeObserver } = window;
    const observe = jest.fn();
    const disconnect = jest.fn();
    let onResize: ResizeObserverCallback | undefined;

    beforeEach(() => {
      onResize = undefined;
      window.ResizeObserver = jest
        .fn()
        .mockImplementation((callback: ResizeObserverCallback) => {
          onResize = callback;
          return { observe, unobserve: jest.fn(), disconnect };
        });
    });

    afterEach(() => {
      window.ResizeObserver = originalResizeObserver;
      document.documentElement.removeAttribute('style');
    });

    // What a calc() that uses multiPageHeaderHeight works out to right now
    const currentHeaderHeight = () =>
      multiPageHeaderHeight.replace(
        /var\((--[\w-]+),\s*([^)]+)\)/g,
        (_match, name: string, fallback: string) =>
          document.documentElement.style.getPropertyValue(name).trim() ||
          fallback.trim(),
      );

    // Gives the header a new measured height, the way a browser would
    const resizeHeader = (header: Element, height: number) => {
      Object.defineProperty(header, 'offsetHeight', {
        configurable: true,
        value: height,
      });
      if (!onResize) {
        throw new Error('The header does not watch its own size');
      }
      const resizeCallback = onResize;
      act(() => resizeCallback([], {} as ResizeObserver));
    };

    it('starts at the fixed header height before the header is measured', () => {
      const { header } = renderHeader();

      expect(currentHeaderHeight()).toBe(
        getStyleAtWidth(header, 'height', desktopWidth),
      );
    });

    it('follows the header when it grows on phones', () => {
      const { header } = renderHeader();

      expect(observe).toHaveBeenCalledWith(header);
      resizeHeader(header, 129);
      expect(currentHeaderHeight()).toBe('129px');
      resizeHeader(header, 80);
      expect(currentHeaderHeight()).toBe('80px');
    });

    it('goes back to the fixed height when the header goes away', () => {
      const { header, unmount } = renderHeader();
      resizeHeader(header, 129);

      unmount();

      expect(disconnect).toHaveBeenCalled();
      expect(currentHeaderHeight()).toBe('80px');
    });

    it('still shows the header in browsers without ResizeObserver', () => {
      Object.defineProperty(window, 'ResizeObserver', {
        configurable: true,
        writable: true,
        value: undefined,
      });
      const { titleText } = renderHeader();

      expect(titleText).toBeInTheDocument();
      expect(currentHeaderHeight()).toBe('80px');
    });
  });
});
