import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import theme from '../../../theme';
import { ContactUncompletedTasksCount } from './ContactUncompletedTasksCount';

const renderCount = () =>
  render(
    <ThemeProvider theme={theme}>
      <ContactUncompletedTasksCount uncompletedTasksCount={2} contactId="abc" />
    </ThemeProvider>,
  );

describe('ContactUncompletedTasksCount', () => {
  it('default', async () => {
    const { getByRole, getByText } = renderCount();

    const TaskCompletedIcon = getByRole('button', {
      name: 'Log Task',
    });

    expect(TaskCompletedIcon).toBeInTheDocument();
    expect(getByText('2')).toBeInTheDocument();
  });

  // In the Contacts list, 40px of padding on each side of this icon took
  // room the contact name needed on phones. jsdom can't measure layout, so
  // these read the CSS that applies at each screen width.
  describe('side padding', () => {
    const getSidePadding = (width: number) => {
      const { getByRole } = renderCount();
      const wrapper = getByRole('button', { name: 'Log Task' }).parentElement;
      if (!wrapper) {
        throw new Error('Log task wrapper not found');
      }
      return {
        left: getStyleAtWidth(wrapper, 'padding-left', width),
        right: getStyleAtWidth(wrapper, 'padding-right', width),
      };
    };

    // 599px is the widest screen before MUI's sm breakpoint
    it.each([360, phoneWidth, 599])('is small at %ipx', (width) => {
      const { left, right } = getSidePadding(width);

      expect(left).toBe(right);
      expect(parseFloat(left)).toBeLessThanOrEqual(8);
    });

    it.each([600, 768, desktopWidth])('stays 40px at %ipx', (width) => {
      expect(getSidePadding(width)).toEqual({ left: '40px', right: '40px' });
    });
  });
});
