import React from 'react';
import { Chip } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { StatusChip } from './StatusChip';

describe('StatusChip', () => {
  it('fills the chip with the tinted status color and no border', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <StatusChip color="warning" label="Incomplete" />
      </ThemeProvider>,
    );

    const chip = getByText('Incomplete').closest('.MuiChip-root');
    // MUI's Alert warning tints, which the designs use for these chips.
    expect(chip).toHaveStyle({
      backgroundColor: 'rgb(255, 244, 229)',
      color: 'rgb(102, 60, 0)',
      border: 'none',
    });
  });

  // The theme used to drop-shadow every chip in the app; the designs want none.
  it('leaves chips flat, with no drop shadow', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <StatusChip color="success" label="Complete" />
        <Chip label="Plain" />
      </ThemeProvider>,
    );

    const shadow = { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' };
    expect(getByText('Complete').closest('.MuiChip-root')).not.toHaveStyle(
      shadow,
    );
    expect(getByText('Plain').closest('.MuiChip-root')).not.toHaveStyle(shadow);
  });
});
