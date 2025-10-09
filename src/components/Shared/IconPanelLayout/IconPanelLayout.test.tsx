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

  const mockBackButton = {
    icon: <div>Back</div>,
    label: 'Go back',
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders main content', () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          percentComplete={0}
          backButton={mockBackButton}
          mainContent={<h1>Main Content</h1>}
        />
      </TestWrapper>,
    );

    expect(getByRole('heading', { name: 'Main Content' })).toBeInTheDocument();
  });

  it('renders icon panel items', () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          percentComplete={0}
          backButton={mockBackButton}
          iconPanelItems={mockIconPanelItems}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    expect(getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Home' })).toBeInTheDocument();
  });

  it('renders back button', () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          percentComplete={50}
          backButton={mockBackButton}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    expect(getByRole('button', { name: 'Go back' })).toBeInTheDocument();
  });

  it('calls onClick when back button is clicked', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          percentComplete={50}
          backButton={mockBackButton}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    const backButton = getByRole('button', { name: 'Go back' });
    userEvent.click(backButton);

    expect(mockBackButton.onClick).toHaveBeenCalled();
  });

  it('calls onClick when icon button is clicked', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          percentComplete={0}
          backButton={mockBackButton}
          iconPanelItems={mockIconPanelItems}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    userEvent.click(getByRole('button', { name: 'Settings' }));

    expect(mockIconPanelItems[0].onClick).toHaveBeenCalled();
  });

  it('renders sidebar when content is provided', () => {
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <IconPanelLayout
          percentComplete={0}
          backButton={mockBackButton}
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
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          percentComplete={0}
          backButton={mockBackButton}
          sidebarTitle="Test Title"
          sidebarContent={<h1>Sidebar Content</h1>}
          isSidebarOpen={true}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    expect(getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Sidebar Content' }),
    ).toBeInTheDocument();
  });

  it('hides sidebar when isSidebarOpen is false', () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          percentComplete={0}
          backButton={mockBackButton}
          sidebarContent={<div>Sidebar Content</div>}
          isSidebarOpen={false}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    expect(getByRole('navigation')).toHaveStyle({ width: '0px' });
  });

  it('shows sidebar when isSidebarOpen is true', () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          percentComplete={0}
          backButton={mockBackButton}
          sidebarContent={<div>Sidebar Content</div>}
          isSidebarOpen={true}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

    expect(getByRole('navigation')).toHaveStyle({ width: '240px' });
  });

  it('applies correct aria attributes to sidebar', () => {
    const { getByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          percentComplete={0}
          backButton={mockBackButton}
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
          percentComplete={0}
          backButton={mockBackButton}
          iconPanelItems={mockIconPanelItems}
          mainContent={<div>Main Content</div>}
        />
      </TestWrapper>,
    );

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
    const { getByTestId, queryAllByRole } = render(
      <TestWrapper>
        <IconPanelLayout
          percentComplete={0}
          backButton={mockBackButton}
          iconPanelItems={[]}
          mainContent={<div data-testid="main-content">Main Content</div>}
        />
      </TestWrapper>,
    );

    expect(getByTestId('main-content')).toBeInTheDocument();
    // Only the back button should be present
    expect(queryAllByRole('button')).toHaveLength(1);
  });
});
