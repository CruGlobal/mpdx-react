import React from 'react';
import MenuOpenSharp from '@mui/icons-material/MenuOpenSharp';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { IconPanelItem } from 'src/components/Shared/IconPanelLayout/IconPanelLayout';
import theme from 'src/theme';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum, PanelTypeEnum } from '../Shared/sharedTypes';
import { PanelLayout } from './PanelLayout';

const title = 'Sidebar Title';

const mockIcons: IconPanelItem[] = [
  {
    key: 'mock-icon',
    icon: <MenuOpenSharp />,
    label: 'Mock Icon',
    isActive: false,
    onClick: jest.fn(),
  },
];

interface TestComponentProps {
  panelType: PanelTypeEnum;
  isSidebarOpen?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  panelType,
  isSidebarOpen,
}) => (
  <ThemeProvider theme={theme}>
    <MinisterHousingAllowanceProvider>
      <PanelLayout
        panelType={panelType}
        sidebarTitle={title}
        mainContent={<h1>Main Content</h1>}
        icons={mockIcons}
        isSidebarOpen={isSidebarOpen}
      />
    </MinisterHousingAllowanceProvider>
  </ThemeProvider>
);

jest.mock('../Shared/Context/MinisterHousingAllowanceContext', () => ({
  ...jest.requireActual('../Shared/Context/MinisterHousingAllowanceContext'),
  useMinisterHousingAllowance: jest.fn(),
}));

(useMinisterHousingAllowance as jest.Mock).mockReturnValue({
  percentComplete: 25,
  pageType: PageEnum.New,
});

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
      <TestComponent panelType={PanelTypeEnum.New} isSidebarOpen={true} />,
    );

    expect(getByRole('heading', { name: 'Main Content' })).toBeInTheDocument();
    expect(getByRole('heading', { name: title })).toBeInTheDocument();

    const progressIndicator = getByRole('progressbar');
    expect(progressIndicator).toBeInTheDocument();
    expect(progressIndicator).toHaveAttribute('aria-valuenow', '25');

    expect(getByTestId('MenuOpenSharpIcon')).toBeInTheDocument();

    const backLink = getByTestId('ArrowBackIcon');
    expect(backLink).toBeInTheDocument();
  });
});
