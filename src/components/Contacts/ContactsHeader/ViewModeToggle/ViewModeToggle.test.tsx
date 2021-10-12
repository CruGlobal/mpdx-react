import React from 'react';
import { MuiThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewModeToggle } from './ViewModeToggle';
import theme from 'src/theme';

const value = 'list';
const onChange = jest.fn();

describe('ViewModeToggle', () => {
  it('default', async () => {
    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <ViewModeToggle onChange={onChange} value={value} />
      </MuiThemeProvider>,
    );

    const bulletedListIcon = getByRole('img', {
      hidden: true,
      name: 'List View',
    });
    const viewColumnIcon = getByRole('img', {
      hidden: true,
      name: 'Column Workflow View',
    });

    expect(bulletedListIcon).toBeInTheDocument();
    expect(viewColumnIcon).toBeInTheDocument();
  });

  it('change event', async () => {
    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <ViewModeToggle onChange={onChange} value={value} />
      </MuiThemeProvider>,
    );

    const bulletedListIcon = getByRole('button', {
      hidden: true,
      name: 'List View',
    });
    const viewColumnIcon = getByRole('button', {
      hidden: true,
      name: 'Column Workflow View',
    });

    userEvent.click(viewColumnIcon);
    expect(onChange).toHaveBeenCalled();
    expect(bulletedListIcon).toBeInTheDocument();
  });
});
