import React from 'react';
import { render } from '@testing-library/react';
import StyledProgress from '.';

describe('StyledProgress', () => {
  it('has correct defaults', () => {
    const { getByTestId, queryByTestId } = render(<StyledProgress />);
    expect(queryByTestId('styledProgressLoading')).toBeNull();
    expect(getByTestId('styledProgressPrimary')).toHaveStyle('width: 0%;');
    expect(getByTestId('styledProgressSecondary')).toHaveStyle('width: 0%;');
  });

  it('has correct overrides', () => {
    const { getByTestId, queryByTestId } = render(
      <StyledProgress primary={0.5} secondary={0.75} />,
    );
    expect(queryByTestId('styledProgressLoading')).toBeNull();
    expect(getByTestId('styledProgressPrimary')).toHaveStyle('width: 50%;');
    expect(getByTestId('styledProgressSecondary')).toHaveStyle('width: 75%;');
  });

  it('allows loading', () => {
    const { getByTestId, queryByTestId } = render(<StyledProgress loading />);
    expect(getByTestId('styledProgressLoading')).toBeTruthy();
    expect(queryByTestId('styledProgressPrimary')).toBeNull();
    expect(queryByTestId('styledProgressSecondary')).toBeNull();
  });
});
