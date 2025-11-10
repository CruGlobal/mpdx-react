import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from '../Shared/MinisterHousingAllowanceContext';
import { PageEnum, PanelTypeEnum } from '../Shared/sharedTypes';
import { PanelLayout } from './PanelLayout';

const title = 'Sidebar Title';

const EmptyTest: React.FC = () => (
  <ThemeProvider theme={theme}>
    <PanelLayout
      panelType={PanelTypeEnum.Empty}
      sidebarTitle={title}
      mainContent={<h1>Main Content</h1>}
    />
  </ThemeProvider>
);

const FilledTest: React.FC = () => (
  <ThemeProvider theme={theme}>
    <MinisterHousingAllowanceProvider type={PageEnum.New}>
      <PanelLayout
        panelType={PanelTypeEnum.New}
        sidebarTitle={title}
        sidebarAriaLabel="New - Step 1"
        mainContent={<h1>Main Content</h1>}
      />
    </MinisterHousingAllowanceProvider>
  </ThemeProvider>
);

jest.mock('../Shared/MinisterHousingAllowanceContext', () => ({
  ...jest.requireActual('../Shared/MinisterHousingAllowanceContext'),
  useMinisterHousingAllowance: jest.fn(),
}));

(useMinisterHousingAllowance as jest.Mock).mockReturnValue({
  percentComplete: 75,
});

//TODO: Add more tests for other panel type and functionality

describe('PanelLayout', () => {
  it('renders main content and sidebar title for Empty panel type', () => {
    const { getByRole } = render(<EmptyTest />);

    expect(getByRole('heading', { name: 'Main Content' })).toBeInTheDocument();
    expect(getByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('renders main content, sidebar title, back link, and progress indicator for New panel type', () => {
    const { getByRole, getByTestId } = render(<FilledTest />);

    expect(getByRole('heading', { name: 'Main Content' })).toBeInTheDocument();
    expect(getByRole('heading', { name: title })).toBeInTheDocument();

    const progressIndicator = getByRole('progressbar');
    expect(progressIndicator).toBeInTheDocument();
    expect(progressIndicator).toHaveAttribute('aria-valuenow', '75');

    const backLink = getByTestId('ArrowBackIcon');
    expect(backLink).toBeInTheDocument();
  });
});
