import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { getTopBarMock } from '../../../TopBar/TopBar.mock';
import { ProfileMenuPanel } from './ProfileMenuPanel';
import theme from 'src/theme';
import TestWrapper from '__tests__/util/TestWrapper';

describe('ProfileMenuPanelForNavBar', () => {
  it('default', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={[getTopBarMock()]}>
          <ProfileMenuPanel />
        </TestWrapper>
      </ThemeProvider>,
    );

    expect(getByTestId('ProfileMenuPanelForNavBar')).toBeInTheDocument();
  });
});
