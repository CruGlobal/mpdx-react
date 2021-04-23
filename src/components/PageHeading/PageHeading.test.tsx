import React from 'react';
import { render } from '@testing-library/react';
import PageHeading from '.';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../theme';

describe('PageHeading', () => {
  it('has correct defaults', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <PageHeading heading="test heading" subheading="test subheading" />
      </ThemeProvider>,
    );
    expect(getByTestId('PageHeading')).toHaveStyle('margin-bottom: -20px');
    expect(getByTestId('PageHeadingContainer')).toHaveStyle(
      'padding-bottom: 20px',
    );
    expect(getByTestId('PageHeadingHeading')).toHaveTextContent('test heading');
    expect(getByTestId('PageHeadingSubheading')).toHaveTextContent(
      'test subheading',
    );
    expect(getByTestId('PageHeadingImg')).toHaveAttribute(
      'src',
      'drawkit-grape-pack-illustration-20.svg',
    );
  });

  it('has correct overrides', () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PageHeading
          heading="test heading"
          imgSrc={require(`../../images/drawkit/grape/drawkit-grape-pack-illustration-1.svg`)}
          overlap={100}
          height={400}
        />
      </ThemeProvider>,
    );
    expect(getByTestId('PageHeading')).toHaveStyle('margin-bottom: -100px');
    expect(getByTestId('PageHeading')).toHaveStyle('height: 400px');
    expect(getByTestId('PageHeadingContainer')).toHaveStyle(
      'padding-bottom: 100px',
    );
    expect(queryByTestId('PageHeadingSubheading')).toBeNull();
    expect(getByTestId('PageHeadingImg')).toHaveAttribute(
      'src',
      'drawkit-grape-pack-illustration-1.svg',
    );
  });

  it('has correct overrides for image', () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PageHeading heading="test heading" image={false} />
      </ThemeProvider>,
    );
    expect(queryByTestId('PageHeadingImg')).not.toBeInTheDocument();
  });
});
