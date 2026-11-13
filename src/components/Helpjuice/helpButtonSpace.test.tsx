import { Box } from '@mui/material';
import { ThemeProvider, styled } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { getStyleAtWidth } from '__tests__/util/styleAtWidth';
import theme from 'src/theme';
import { helpButtonSpace } from './helpButtonSpace';

// Below 600px the 44px help button sits 16px from the bottom, so the end of a page needs about
// 76px. From 600px up the 60px button's top edge is 160px from the bottom, so it needs about 176px.
const phoneRoom = 76;
const widerRoom = 176;

const PaddedScroller = styled('main')(({ theme }) => ({
  padding: theme.spacing(4),
  ...helpButtonSpace(theme),
}));

const getRoom = (element: Element, width: number): number =>
  parseFloat(getStyleAtWidth(element, 'padding-bottom', width)) || 0;

describe('helpButtonSpace', () => {
  it('pads the bottom 80px below 600px and 176px from 600px up', () => {
    expect(helpButtonSpace(theme)).toEqual({
      paddingBottom: '80px',
      [theme.breakpoints.up('sm')]: { paddingBottom: '176px' },
    });
  });

  describe('as an sx value', () => {
    const renderScroller = () =>
      render(
        <ThemeProvider theme={theme}>
          <Box component="main" sx={helpButtonSpace}>
            <button>Last button</button>
          </Box>
        </ThemeProvider>,
      );

    it.each([320, 360, 390, 599])(
      'leaves room for the small help button on a %ipx phone',
      (width) => {
        const { getByRole } = renderScroller();

        const room = getRoom(getByRole('main'), width);
        expect(room).toBeGreaterThanOrEqual(phoneRoom);
        expect(room).toBeLessThan(widerRoom);
      },
    );

    it.each([600, 768, 1024, 1280])(
      'leaves room for the full size help button at %ipx',
      (width) => {
        const { getByRole } = renderScroller();

        expect(getRoom(getByRole('main'), width)).toBeGreaterThanOrEqual(
          widerRoom,
        );
      },
    );
  });

  describe('spread into styled()', () => {
    it('wins over the bottom of an earlier padding shorthand', () => {
      const { getByRole } = render(
        <ThemeProvider theme={theme}>
          <PaddedScroller />
        </ThemeProvider>,
      );

      const scroller = getByRole('main');
      expect(getRoom(scroller, 390)).toBeGreaterThanOrEqual(phoneRoom);
      expect(getRoom(scroller, 768)).toBeGreaterThanOrEqual(widerRoom);
    });
  });
});
