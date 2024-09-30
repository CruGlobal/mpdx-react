import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { NavItem } from './NavItem';

const accountListId = 'test-id';
const title = 'Test NavItem Button';

describe('NavItem', () => {
  it('default', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <NavItem
          depth={0}
          href={`/test/${accountListId}`}
          open={false}
          title={title}
        />
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
  });

  it('renders image', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <NavItem imageUrl="/img.png" title={title} />
      </ThemeProvider>,
    );

    expect(getByRole('img')).toHaveAttribute('src', '/img.png');
  });
});
