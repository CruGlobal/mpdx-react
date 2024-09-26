import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from '../../../theme';
import { StarredItemIcon } from './StarredItemIcon';

describe('StarTaskIconButton', () => {
  it('renders not starred', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <StarredItemIcon isStarred={false} />
      </ThemeProvider>,
    );

    const starFilledIcon = queryByTestId('Filled Star Icon');
    const starOutlineIcon = queryByTestId('Outline Star Icon');

    expect(starFilledIcon).not.toBeInTheDocument();
    expect(starOutlineIcon).toBeInTheDocument();
  });

  it('renders starred', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <StarredItemIcon isStarred={true} />
      </ThemeProvider>,
    );

    const starFilledIcon = queryByTestId('Filled Star Icon');
    const starOutlineIcon = queryByTestId('Outline Star Icon');

    expect(starFilledIcon).toBeInTheDocument();
    expect(starOutlineIcon).not.toBeInTheDocument();
  });
});
