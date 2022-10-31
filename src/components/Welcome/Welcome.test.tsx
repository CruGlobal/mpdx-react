import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import Welcome from '.';

describe('Welcome', () => {
  it('has correct defaults', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Welcome title="test title" subtitle="test subtitle">
          <div data-testid="children">children</div>
        </Welcome>
      </ThemeProvider>,
    );
    expect(getByTestId('welcomeTitle')).toHaveTextContent('test title');
    expect(getByTestId('welcomeSubtitle')).toHaveTextContent('test subtitle');
    expect(getByTestId('welcomeImg')).toHaveAttribute('src');
    expect(getByTestId('children')).toHaveTextContent('children');
  });

  it('has correct overrides', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <Welcome
          title={<div data-testid="testTitle">test title</div>}
          subtitle={<div data-testid="testSubtitle">test subtitle</div>}
          imgSrc={require(`../../images/drawkit/grape/drawkit-grape-pack-illustration-1.svg`)}
        />
      </ThemeProvider>,
    );
    expect(() => getByTestId('welcomeTitle')).toThrow();
    expect(() => getByTestId('welcomeSubtitle')).toThrow();
    expect(getByTestId('testTitle')).toHaveTextContent('test title');
    expect(getByTestId('testSubtitle')).toHaveTextContent('test subtitle');
    expect(getByTestId('welcomeImg')).toHaveAttribute('src');
  });
});
