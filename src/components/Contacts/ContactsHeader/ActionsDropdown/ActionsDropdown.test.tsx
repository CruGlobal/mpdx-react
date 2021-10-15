import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../../theme';
import { ActionsDropDown } from './ActionsDropdown';

const onChange = jest.fn();

describe('ActionsDropDown', () => {
  it('default', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <ActionsDropDown disabled={true} onChange={onChange} value={''} />
      </ThemeProvider>,
    );

    const actionsDropdown = getByRole('button');
    expect(actionsDropdown).toBeInTheDocument();
    expect(actionsDropdown.getAttribute('class')).toContain('Mui-disabled');
  });
});
