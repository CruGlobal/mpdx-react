import React from 'react';
import { MuiThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import theme from '../../../theme';
import { StarredItemIcon } from './StarredItemIcon';

describe('StarTaskIconButton', () => {
  it('renders not starred', async () => {
    const { queryByRole } = render(
      <MuiThemeProvider theme={theme}>
        <StarredItemIcon isStarred={false} />
      </MuiThemeProvider>,
    );

    const starFilledIcon = queryByRole('img', {
      hidden: true,
      name: 'Filled Star Icon',
    });
    const starOutlineIcon = queryByRole('img', {
      hidden: true,
      name: 'Outline Star Icon',
    });

    expect(starFilledIcon).not.toBeInTheDocument();
    expect(starOutlineIcon).toBeInTheDocument();
  });

  it('renders starred', async () => {
    const { queryByRole } = render(
      <MuiThemeProvider theme={theme}>
        <StarredItemIcon isStarred={true} />
      </MuiThemeProvider>,
    );

    const starFilledIcon = queryByRole('img', {
      hidden: true,
      name: 'Filled Star Icon',
    });
    const starOutlineIcon = queryByRole('img', {
      hidden: true,
      name: 'Outline Star Icon',
    });

    expect(starFilledIcon).toBeInTheDocument();
    expect(starOutlineIcon).not.toBeInTheDocument();
  });
});
