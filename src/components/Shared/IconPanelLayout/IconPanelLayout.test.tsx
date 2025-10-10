import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import {
  IconPanelItem,
  IconPanelLayout,
  IconPanelLayoutProps,
} from './IconPanelLayout';

const mockIconPanelItems: IconPanelItem[] = [
  {
    key: 'settings',
    icon: <SettingsIcon />,
    label: 'Settings',
    isActive: true,
    onClick: jest.fn(),
  },
  {
    key: 'home',
    icon: <HomeIcon />,
    label: 'Home',
    isActive: false,
    onClick: jest.fn(),
  },
];

const TestComponent: React.FC<Partial<IconPanelLayoutProps>> = (props) => (
  <ThemeProvider theme={theme}>
    <IconPanelLayout
      percentComplete={0}
      backHref="/back"
      mainContent={<h1>Main Content</h1>}
      iconPanelItems={mockIconPanelItems}
      {...props}
    />
  </ThemeProvider>
);

describe('IconPanelLayout', () => {
  it('renders main content, icon panel items, and back link', () => {
    const { getByRole } = render(<TestComponent backHref="/test-back-url" />);

    expect(getByRole('heading', { name: 'Main Content' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Home' })).toBeInTheDocument();

    const backLink = getByRole('link', { name: 'Go back' });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/test-back-url');
  });

  it('calls onClick when icon button is clicked', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Settings' }));

    expect(mockIconPanelItems[0].onClick).toHaveBeenCalled();
  });

  it('renders sidebar when content is provided', () => {
    const { getByTestId } = render(
      <TestComponent
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
      <TestComponent sidebarTitle="Test Title" isSidebarOpen={true} />,
    );

    expect(getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
  });

  it('hides sidebar when isSidebarOpen is false', () => {
    const { getByRole } = render(
      <TestComponent
        sidebarContent={<div>Sidebar Content</div>}
        isSidebarOpen={false}
      />,
    );

    expect(getByRole('navigation')).toHaveStyle({ width: '0px' });
  });

  it('shows sidebar when isSidebarOpen is true', () => {
    const { getByRole } = render(
      <TestComponent
        sidebarContent={<div>Sidebar Content</div>}
        isSidebarOpen={true}
      />,
    );

    expect(getByRole('navigation')).toHaveStyle({ width: '240px' });
  });

  it('applies correct aria attributes to sidebar', () => {
    const { getByRole } = render(
      <TestComponent
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
    const { getByRole } = render(<TestComponent />);

    const activeButton = getByRole('button', { name: 'Settings' });
    const inactiveButton = getByRole('button', { name: 'Home' });

    // Active button should be blue
    expect(activeButton).toHaveStyle({ color: theme.palette.mpdxBlue.main });

    // Inactive button should be gray
    expect(inactiveButton).toHaveStyle({
      color: theme.palette.cruGrayDark.main,
    });
  });

  it('handles empty icon panel items gracefully', () => {
    const { getByTestId, getAllByRole } = render(
      <TestComponent
        iconPanelItems={[]}
        mainContent={<div data-testid="main-content">Main Content</div>}
      />,
    );

    expect(getByTestId('main-content')).toBeInTheDocument();
    // Only the back link should be present (no icon buttons)
    expect(getAllByRole('button')).toHaveLength(1);
  });
});
