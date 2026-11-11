import React from 'react';
import { ThemeProvider, getContrastRatio } from '@mui/material/styles';
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
  // WCAG AA: the outlined badge's text sits on the white card
  it.each([
    [MpdCapHealthEnum.Healthy, 'Healthy'],
    [MpdCapHealthEnum.OnTrack, 'On Track'],
    [MpdCapHealthEnum.NeedsAttention, 'Needs Attention'],
  ])('shows %s as "%s" in a color readable on white', (capHealth, label) => {
    const { getByTestId } = renderBadge(capHealth);

    const badge = getByTestId('cap-health-badge');
    expect(badge).toHaveTextContent(label);
    const { color, borderColor } = getComputedStyle(badge);
    expect(getContrastRatio(color, '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
    expect(borderColor).toBe(color);
  });

  it('gives the percent it graded in a tooltip', async () => {
    const { getByTestId, findByRole } = renderBadge(MpdCapHealthEnum.OnTrack);

    userEvent.hover(getByTestId('cap-health-badge'));

    expect(await findByRole('tooltip')).toHaveTextContent(
      '58.2% of Personal CAP last month',
    );
  });

  // Rounding up would show 65.0% on an On Track badge, a Healthy number
  it('rounds the tooltip percent down so it never reaches the next grade', async () => {
    const { getByTestId, findByRole } = renderBadge(
      MpdCapHealthEnum.OnTrack,
      64.97,
    );

    userEvent.hover(getByTestId('cap-health-badge'));

    expect(await findByRole('tooltip')).toHaveTextContent(
      '64.9% of Personal CAP last month',
    );
  });

  // An aria-label from the tooltip would replace the grade word for screen readers
  it('keeps the grade word readable and adds the percent as a description', async () => {
    const { getByTestId, findByRole } = renderBadge(MpdCapHealthEnum.OnTrack);

    const badge = getByTestId('cap-health-badge');
    userEvent.hover(badge);

    await findByRole('tooltip');
    expect(badge).not.toHaveAttribute('aria-label');
    expect(badge).toHaveTextContent('On Track');
    expect(badge).toHaveAccessibleDescription(
      '58.2% of Personal CAP last month',
    );
  });

  it('shows nothing for staff with no Personal CAP', async () => {
    const { queryByTestId } = renderBadge(null, null);

    await waitFor(() =>
      expect(queryByTestId('cap-health-badge')).not.toBeInTheDocument(),
    );
  });
});
