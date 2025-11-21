import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum, PanelTypeEnum } from '../Shared/sharedTypes';
import { PanelLayout } from './PanelLayout';

const title = 'Sidebar Title';

interface TestComponentProps {
  panelType: PanelTypeEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({ panelType }) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <MinisterHousingAllowanceProvider>
        <PanelLayout
          panelType={panelType}
          sidebarTitle={title}
          mainContent={<h1>Main Content</h1>}
        />
      </MinisterHousingAllowanceProvider>
    </TestRouter>
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

  it('renders main content, sidebar title, back link, and progress indicator for New panel type', () => {
    const { getByRole, getByTestId } = render(
      <TestComponent panelType={PanelTypeEnum.New} />,
    );

    expect(getByRole('heading', { name: 'Main Content' })).toBeInTheDocument();
    expect(getByRole('heading', { name: title })).toBeInTheDocument();

    const progressIndicator = getByRole('progressbar');
    expect(progressIndicator).toBeInTheDocument();
    expect(progressIndicator).toHaveAttribute('aria-valuenow', '25');

    const backLink = getByTestId('ArrowBackIcon');
    expect(backLink).toBeInTheDocument();
  });
});
