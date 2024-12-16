import React from 'react';
import { render } from '@testing-library/react';
import { formatPercentage } from './StyledProgress';
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

  it('displays receivedBelow and committedBelow', () => {
    const { getByText } = render(
      <StyledProgress
        receivedBelow={'receivedBelow'}
        committedBelow={'committedBelow'}
      />,
    );
    expect(getByText('receivedBelow')).toBeInTheDocument();
    expect(getByText('/')).toBeInTheDocument();
    expect(getByText('committedBelow')).toBeInTheDocument();
  });

  describe('formatPercentage()', () => {
    it('should return the correct percentages', () => {
      expect(formatPercentage(0)).toEqual('0%');
      expect(formatPercentage(0.1)).toEqual('10%');
      expect(formatPercentage(0.85)).toEqual('85%');
      expect(formatPercentage(1)).toEqual('100%');
      expect(formatPercentage(77)).toEqual('77%');
      expect(formatPercentage(0.3)).toEqual('30%');
    });
  });
});
