import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { NavItem } from './NavItem';
import theme from 'src/theme';

const accountListId = 'test-id';
const title = 'Test NavItem Button';

describe('NavItem', () => {
  it('default', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <NavItem
          depth={0}
          href="/test/[accountListId]"
          as={`/test/${accountListId}`}
          open={false}
          title={title}
        />
      </ThemeProvider>,
    );

    expect(
      getByRole('button', { hidden: true, name: title }),
    ).toBeInTheDocument();
  });
});
