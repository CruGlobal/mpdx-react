import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { NavItem } from './NavItem';
import theme from 'src/theme';

const accountListId = 'test-id';
const title = 'Test NavItem Button';

describe('NavItem', () => {
  it('default', async () => {
    const { getByText } = render(
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

    expect(getByText(title)).toBeInTheDocument();
  });

  it('closed nav item with children', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <NavItem
          depth={0}
          href="/test/[accountListId]"
          as={`/test/${accountListId}`}
          open={false}
          title={title}
        >
          <span />
        </NavItem>
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(
      getByRole('img', { hidden: true, name: 'Collapse' }),
    ).toBeInTheDocument();
  });

  it('opened nav item with children', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <NavItem
          depth={0}
          href="/test/[accountListId]"
          as={`/test/${accountListId}`}
          open={true}
          title={title}
        >
          <span />
        </NavItem>
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(
      getByRole('img', { hidden: true, name: 'Expand' }),
    ).toBeInTheDocument();
  });
});
