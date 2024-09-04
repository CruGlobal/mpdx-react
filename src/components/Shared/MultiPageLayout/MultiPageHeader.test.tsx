import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { HeaderTypeEnum, MultiPageHeader } from './MultiPageHeader';

const totalBalance = 'CA111';
const title = 'test title';
const onNavListToggle = jest.fn();

describe('MultiPageHeader', () => {
  it('default', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <MultiPageHeader
          isNavListOpen={true}
          title={title}
          onNavListToggle={onNavListToggle}
          rightExtra={totalBalance}
          headerType={HeaderTypeEnum.Report}
        />
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText('CA111')).toBeInTheDocument();
    userEvent.click(
      getByRole('button', { hidden: true, name: 'Toggle Navigation Panel' }),
    );
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  });

  it('should not render rightExtra if undefined', async () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <MultiPageHeader
          isNavListOpen={true}
          title={title}
          onNavListToggle={onNavListToggle}
          rightExtra={undefined}
          headerType={HeaderTypeEnum.Report}
        />
      </ThemeProvider>,
    );

    expect(queryByText('CA111')).toBeNull();
  });

  it('should render the Settings menu', async () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <MultiPageHeader
          isNavListOpen={true}
          title={title}
          onNavListToggle={onNavListToggle}
          rightExtra={undefined}
          headerType={HeaderTypeEnum.Settings}
        />
      </ThemeProvider>,
    );

    expect(getByText('Toggle Preferences Menu')).toBeInTheDocument();
    expect(getByTestId('SettingsMenuIcon')).toBeInTheDocument();
  });

  it('should render the Tools menu', async () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <MultiPageHeader
          isNavListOpen={true}
          title={title}
          onNavListToggle={onNavListToggle}
          rightExtra={undefined}
          headerType={HeaderTypeEnum.Tools}
        />
      </ThemeProvider>,
    );

    expect(getByText('Toggle Tools Menu')).toBeInTheDocument();
    expect(getByTestId('ToolsMenuIcon')).toBeInTheDocument();
  });
});
