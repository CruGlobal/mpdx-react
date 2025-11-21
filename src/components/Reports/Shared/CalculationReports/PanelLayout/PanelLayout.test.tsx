import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import MenuOpenSharp from '@mui/icons-material/MenuOpenSharp';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    <PanelLayout
      sidebarTitle={title}
      mainContent={<h1>Main Content</h1>}
      icons={mockIcons}
      backHref="/back"
      percentComplete={25}
      {...props}
    />
  </ThemeProvider>
);

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
      color: theme.palette.cruGrayDark.main,
    });
  });

  it('handles empty icon panel items gracefully', () => {
    const { getByTestId, getAllByRole } = render(
      <TestComponent
        panelType={PanelTypeEnum.Other}
        icons={[]}
        mainContent={<div data-testid="main-content">Main Content</div>}
      />,
    );

    expect(getByTestId('main-content')).toBeInTheDocument();
    expect(getAllByRole('button')).toHaveLength(1);
  });
});
