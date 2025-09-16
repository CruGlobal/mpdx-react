import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { IconPanelItem, IconPanelLayout } from './IconPanelLayout';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('IconPanelLayout', () => {
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

  const mockBottomIconPanelItems: IconPanelItem[] = [
    {
      key: 'back',
      icon: <div>Back</div>,
      label: 'Go back',
      onClick: jest.fn(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders main content', () => {
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <IconPanelLayout
          mainContent={<div data-testid="main-content">Main Content</div>}
        />
      </TestWrapper>,
    );

    expect(getByTestId('main-content')).toBeInTheDocument();
    expect(getByText('Main Content')).toBeInTheDocument();
  });

  it('renders icon panel items', () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          iconPanelItems={mockIconPanelItems}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    expect(getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Home' })).toBeInTheDocument();
  });

  it('renders bottom icon panel items', () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          bottomIconPanelItems={mockBottomIconPanelItems}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    expect(getByRole('button', { name: 'Go back' })).toBeInTheDocument();
  });

  it('calls onClick when icon button is clicked', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          iconPanelItems={mockIconPanelItems}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    const settingsButton = getByRole('button', { name: 'Settings' });
    userEvent.click(settingsButton);

    expect(mockIconPanelItems[0].onClick).toHaveBeenCalledTimes(1);
  });

  it('renders sidebar when content is provided', () => {
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <IconPanelLayout
          sidebarContent={
            <div data-testid="sidebar-content">Sidebar Content</div>
          }
          isSidebarOpen={true}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    expect(getByTestId('sidebar-content')).toBeInTheDocument();
    expect(getByText('Sidebar Content')).toBeInTheDocument();
  });

  it('renders sidebar title when provided', () => {
    const { getByText } = render(
      <TestWrapper>
        <IconPanelLayout
          sidebarTitle="Test Title"
          sidebarContent={<div>Sidebar Content</div>}
          isSidebarOpen={true}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    expect(getByText('Test Title')).toBeInTheDocument();
  });

  it('hides sidebar when isSidebarOpen is false', () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          sidebarContent={
            <div data-testid="sidebar-content">Sidebar Content</div>
          }
          isSidebarOpen={false}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    const sidebar = getByRole('navigation');
    expect(sidebar).toHaveStyle({ width: '0px' });
  });

  it('shows sidebar when isSidebarOpen is true', () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          sidebarContent={
            <div data-testid="sidebar-content">Sidebar Content</div>
          }
          isSidebarOpen={true}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    const sidebar = getByRole('navigation');
    expect(sidebar).toHaveStyle({ width: '240px' });
  });

  it('uses sectionListPanel as fallback for sidebarContent (legacy compatibility)', () => {
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <IconPanelLayout
          sectionListPanel={<div data-testid="section-list">Section List</div>}
          isSidebarOpen={true}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    expect(getByTestId('section-list')).toBeInTheDocument();
    expect(getByText('Section List')).toBeInTheDocument();
  });

  it('prioritizes sidebarContent over sectionListPanel', () => {
    const { getByTestId, queryByTestId } = render(
      <TestWrapper>
        <IconPanelLayout
          sidebarContent={
            <div data-testid="sidebar-content">Sidebar Content</div>
          }
          sectionListPanel={<div data-testid="section-list">Section List</div>}
          isSidebarOpen={true}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    expect(getByTestId('sidebar-content')).toBeInTheDocument();
    expect(queryByTestId('section-list')).not.toBeInTheDocument();
  });

  it('applies correct aria attributes to sidebar', () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          sidebarContent={<div>Sidebar Content</div>}
          sidebarAriaLabel="Test Sidebar"
          isSidebarOpen={true}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    const sidebar = getByRole('navigation');
    expect(sidebar).toHaveAttribute('aria-label', 'Test Sidebar');
    expect(sidebar).toHaveAttribute('aria-expanded', 'true');
  });

  it('applies correct styling to active icon buttons', () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          iconPanelItems={mockIconPanelItems}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    const activeButton = getByRole('button', { name: 'Settings' });
    const inactiveButton = getByRole('button', { name: 'Home' });

    // Active button should have blue color
    expect(activeButton).toHaveStyle({ color: theme.palette.mpdxBlue.main });

    // Inactive button should have gray color
    expect(inactiveButton).toHaveStyle({
      color: theme.palette.cruGrayDark.main,
    });
  });

  it('handles empty icon panel items gracefully', () => {
    const { getByTestId, queryByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          iconPanelItems={[]}
          mainContent={<div data-testid="main-content">Main Content</div>}
        />
      </TestWrapper>,
    );

    expect(getByTestId('main-content')).toBeInTheDocument();
    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies main-content class for print styles', () => {
    const { container } = render(
      <TestWrapper>
        <IconPanelLayout mainContent={<div>Main Content</div>} />
      </TestWrapper>,
    );

    const mainContent = container.querySelector('.main-content');
    expect(mainContent).toBeInTheDocument();
  });
});
