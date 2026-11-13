import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import MenuOpenSharp from '@mui/icons-material/MenuOpenSharp';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mediaQuery, { MediaValues } from 'css-mediaquery';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { getStyleAtWidth } from '__tests__/util/styleAtWidth';
import theme from 'src/theme';
import { PanelTypeEnum } from '../Shared/sharedTypes';
import { IconPanelItem, PanelLayout, PanelLayoutProps } from './PanelLayout';

const title = 'Sidebar Title';

const mockIcons: IconPanelItem[] = [
  {
    key: 'mock-icon-1',
    icon: <MenuOpenSharp />,
    label: 'Mock Icon 1',
    isActive: true,
    onClick: jest.fn(),
  },
  {
    key: 'mock-icon-2',
    icon: <HomeIcon />,
    label: 'Mock Icon 2',
    isActive: false,
    onClick: jest.fn(),
  },
];

interface TestComponentProps extends Partial<PanelLayoutProps> {
  panelType: PanelTypeEnum;
}

const TestComponent: React.FC<TestComponentProps> = (props) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider>
        <PanelLayout
          sidebarTitle={title}
          mainContent={<h1>Main Content</h1>}
          icons={mockIcons}
          backHref="/back"
          percentComplete={25}
          {...props}
        />
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

const getMainContent = (container: HTMLElement): HTMLElement => {
  const mainContent = container.querySelector<HTMLElement>('.main-content');
  if (!mainContent) {
    throw new Error('No main content element');
  }
  return mainContent;
};

// The help button covers about 76px at the bottom of phones and 176px from 600px up
const getEndRoom = (element: Element, width: number): number =>
  parseFloat(getStyleAtWidth(element, 'padding-bottom', width)) || 0;

// jsdom can't parse some selectors MUI writes, so treat those as not matching
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

// getStyleAtWidth only checks screens, so this works out which value of `property` wins for
// `element` when it is printed. Later rules win, as Emotion writes one class per element.
const getPrintStyle = (element: Element, property: string): string => {
  const media: Partial<MediaValues> = { type: 'print', width: '816px' };
  let value = '';
  const visit = (rules: CSSRuleList): void => {
    Array.from(rules).forEach((rule) => {
      if (isMediaRule(rule)) {
        if (mediaQuery.match(rule.media.mediaText, media)) {
          visit(rule.cssRules);
        }
      } else if (isStyleRule(rule) && safeMatches(element, rule.selectorText)) {
        value = rule.style.getPropertyValue(property) || value;
      }
    });
  };
  Array.from(document.styleSheets).forEach((sheet) => visit(sheet.cssRules));
  return value;
};

describe('PanelLayout', () => {
  it('renders main content and sidebar title for Empty panel type', () => {
    const { getByRole } = render(
      <TestComponent panelType={PanelTypeEnum.Empty} />,
    );

    expect(getByRole('heading', { name: 'Main Content' })).toBeInTheDocument();
    expect(getByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('renders main content, sidebar title, back link, and progress indicator for New panel type', async () => {
    const { getByRole, getByTestId } = render(
      <TestComponent
        panelType={PanelTypeEnum.Other}
        isSidebarOpen={true}
        backHref="/dashboard"
      />,
    );

    expect(getByRole('heading', { name: 'Main Content' })).toBeInTheDocument();
    expect(getByRole('heading', { name: title })).toBeInTheDocument();

    const progressIndicator = getByRole('progressbar');
    expect(progressIndicator).toBeInTheDocument();
    expect(progressIndicator).toHaveAttribute('aria-valuenow', '25');

    expect(getByTestId('MenuOpenSharpIcon')).toBeInTheDocument();

    const backLink = getByRole('link', { name: 'Back to dashboard' });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/dashboard');
  });

  it('calls onClick when icon button is clicked', async () => {
    const { getByRole } = render(
      <TestComponent panelType={PanelTypeEnum.Other} />,
    );

    userEvent.click(getByRole('button', { name: 'Mock Icon 1' }));

    expect(mockIcons[0].onClick).toHaveBeenCalled();
  });

  it('renders sidebar when content is provided', () => {
    const { getByTestId } = render(
      <TestComponent
        panelType={PanelTypeEnum.Other}
        sidebarContent={
          <div data-testid="sidebar-content">Sidebar Content</div>
        }
        isSidebarOpen={true}
      />,
    );

    expect(getByTestId('sidebar-content')).toBeInTheDocument();
  });

  it('renders sidebar title when provided', () => {
    const { getByRole } = render(
      <TestComponent
        panelType={PanelTypeEnum.Other}
        sidebarTitle="Test Title"
        isSidebarOpen={true}
      />,
    );

    expect(getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
  });

  it('hides sidebar when isSidebarOpen is false', () => {
    const { getByRole } = render(
      <TestComponent
        panelType={PanelTypeEnum.Other}
        sidebarContent={<div>Sidebar Content</div>}
        isSidebarOpen={false}
      />,
    );

    expect(getByRole('navigation')).toHaveStyle({ width: '0px' });
  });

  it('shows sidebar when isSidebarOpen is true', () => {
    const { getByRole } = render(
      <TestComponent
        panelType={PanelTypeEnum.Other}
        sidebarContent={<div>Sidebar Content</div>}
        isSidebarOpen={true}
      />,
    );

    expect(getByRole('navigation')).toHaveStyle({ width: '240px' });
  });

  it('applies correct aria attributes to sidebar', () => {
    const { getByRole } = render(
      <TestComponent
        panelType={PanelTypeEnum.Other}
        sidebarContent={<div>Sidebar Content</div>}
        isSidebarOpen={true}
        sidebarAriaLabel="Test Sidebar"
      />,
    );

    const sidebar = getByRole('navigation');
    expect(sidebar).toHaveAttribute('aria-label', 'Test Sidebar');
    expect(sidebar).toHaveAttribute('aria-expanded', 'true');
  });

  it('applies correct styling to active icon buttons', () => {
    const { getByRole } = render(
      <TestComponent panelType={PanelTypeEnum.Other} />,
    );

    const activeButton = getByRole('button', { name: 'Mock Icon 1' });
    const inactiveButton = getByRole('button', { name: 'Mock Icon 2' });

    expect(activeButton).toHaveStyle({ color: theme.palette.mpdxBlue.main });
    expect(inactiveButton).toHaveStyle({
      color: theme.palette.mpdxGrayDark.main,
    });
    expect(activeButton).toHaveAttribute('aria-current', 'step');
    expect(inactiveButton).not.toHaveAttribute('aria-current');
  });

  it('scrolls main content to top when currentIndex changes', async () => {
    const { rerender, container } = render(
      <TestComponent panelType={PanelTypeEnum.Other} currentIndex={0} />,
    );

    const mainContent = container.querySelector('.main-content')!;
    mainContent.scrollTop = 500;

    rerender(
      <TestComponent panelType={PanelTypeEnum.Other} currentIndex={1} />,
    );

    await waitFor(() => expect(mainContent.scrollTop).toBe(0));
  });

  it('renders an indeterminate progress indicator when progressLoading is true', () => {
    const { getByRole, queryByText } = render(
      <TestComponent
        panelType={PanelTypeEnum.Other}
        progressLoading={true}
        percentComplete={42}
      />,
    );

    const progressIndicator = getByRole('progressbar');
    expect(progressIndicator).toBeInTheDocument();
    expect(progressIndicator).not.toHaveAttribute('aria-valuenow');
    expect(queryByText('42%')).not.toBeInTheDocument();
  });

  it('hides the progress indicator when percentComplete is null', () => {
    const { queryByRole } = render(
      <TestComponent panelType={PanelTypeEnum.Other} percentComplete={null} />,
    );

    expect(queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('disables an icon button when disabled is true', () => {
    const disabledIcons: IconPanelItem[] = [
      {
        key: 'disabled-icon',
        icon: <HomeIcon />,
        label: 'Disabled Icon',
        disabled: true,
        onClick: jest.fn(),
      },
    ];

    const { getByRole } = render(
      <TestComponent panelType={PanelTypeEnum.Other} icons={disabledIcons} />,
    );

    expect(getByRole('button', { name: 'Disabled Icon' })).toBeDisabled();
  });

  it('handles empty icon panel items gracefully', () => {
    const { getByTestId, queryAllByRole } = render(
      <TestComponent
        panelType={PanelTypeEnum.Other}
        icons={[]}
        mainContent={<div data-testid="main-content">Main Content</div>}
      />,
    );

    expect(getByTestId('main-content')).toBeInTheDocument();
    // With empty icons array, no icon buttons should render
    expect(queryAllByRole('button')).toHaveLength(0);
  });

  describe('end of the main content', () => {
    it.each([PanelTypeEnum.Empty, PanelTypeEnum.Other])(
      'leaves room for the help button on %s pages so the last control can scroll clear of it',
      (panelType) => {
        const { container, getByRole } = render(
          <TestComponent
            panelType={panelType}
            mainContent={<button>Continue</button>}
          />,
        );

        const mainContent = getMainContent(container);
        expect(mainContent).toContainElement(
          getByRole('button', { name: 'Continue' }),
        );
        expect(getEndRoom(mainContent, 360)).toBeGreaterThanOrEqual(76);
        expect(getEndRoom(mainContent, 390)).toBeGreaterThanOrEqual(76);
        expect(getEndRoom(mainContent, 768)).toBeGreaterThanOrEqual(176);
        expect(getEndRoom(mainContent, 1280)).toBeGreaterThanOrEqual(176);
      },
    );

    it('leaves out the help button room when printed, since the button does not print', () => {
      const { container } = render(
        <TestComponent panelType={PanelTypeEnum.Other} />,
      );

      // jsdom drops a padding shorthand, so no padding-bottom reads as 0 (the 32px from padding)
      const printRoom =
        parseFloat(
          getPrintStyle(getMainContent(container), 'padding-bottom'),
        ) || 0;
      expect(printRoom).toBeLessThan(76);
    });
  });
});
