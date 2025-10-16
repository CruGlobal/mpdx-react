import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestSetupProvider } from 'src/components/Setup/SetupProvider';
import theme from 'src/theme';
import { HeaderTypeEnum, MultiPageHeader } from './MultiPageHeader';

const totalBalance = 'CA111';
const title = 'test title';
const onNavListToggle = jest.fn();

interface TestComponentProps {
  headerType?: HeaderTypeEnum;
  noRightExtra?: boolean;
  onSetupTour?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  headerType = HeaderTypeEnum.Report,
  noRightExtra = false,
  onSetupTour,
}) => (
  <ThemeProvider theme={theme}>
    <TestSetupProvider onSetupTour={onSetupTour}>
      <MultiPageHeader
        isNavListOpen={true}
        title={title}
        onNavListToggle={onNavListToggle}
        rightExtra={noRightExtra ? undefined : totalBalance}
        headerType={headerType}
      />
    </TestSetupProvider>
  </ThemeProvider>
);

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
    expect(getByTestId('ReportsFilterIcon')).toBeInTheDocument();
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

  it('should render the Tools menu', async () => {
    const { getByTestId, getByText } = render(
      <TestComponent headerType={HeaderTypeEnum.Tools} />,
    );

    expect(getByText('Toggle Tools Menu')).toBeInTheDocument();
    expect(getByTestId('ToolsMenuIcon')).toBeInTheDocument();
  });
});
