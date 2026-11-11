import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MpdCapHealthEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { CapHealthBadge } from './CapHealthBadge';

const renderBadge = (
  capHealth: MpdCapHealthEnum | null,
  percentOfCap: number | null = 58.25,
) =>
  render(
    <ThemeProvider theme={theme}>
      <CapHealthBadge capHealth={capHealth} percentOfCap={percentOfCap} />
    </ThemeProvider>,
  );

// MPDX-10323: Healthy 65%+, On Track 50% to under 65%, Needs Attention under 50%
describe('CapHealthBadge', () => {
  it.each([
    [MpdCapHealthEnum.Healthy, 'Healthy', theme.palette.chipGreenDark.main],
    [MpdCapHealthEnum.OnTrack, 'On Track', theme.palette.chipYellowDark.main],
    [
      MpdCapHealthEnum.NeedsAttention,
      'Needs Attention',
      theme.palette.chipRedDark.main,
    ],
  ])('shows %s as "%s" in its color', (capHealth, label, color) => {
    const { getByTestId } = renderBadge(capHealth);

    const badge = getByTestId('cap-health-badge');
    expect(badge).toHaveTextContent(label);
    expect(badge).toHaveStyle({ color, borderColor: color });
  });

  it('gives the percent it graded in a tooltip', async () => {
    const { getByTestId, findByRole } = renderBadge(MpdCapHealthEnum.OnTrack);

    userEvent.hover(getByTestId('cap-health-badge'));

    expect(await findByRole('tooltip')).toHaveTextContent(
      '58.3% of Personal CAP last month',
    );
  });

  it('shows nothing for staff with no Personal CAP', async () => {
    const { queryByTestId } = renderBadge(null, null);

    await waitFor(() =>
      expect(queryByTestId('cap-health-badge')).not.toBeInTheDocument(),
    );
  });
});
