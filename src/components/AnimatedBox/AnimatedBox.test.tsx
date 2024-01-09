import React from 'react';
import { render } from '@testing-library/react';
import AnimatedBox from '.';

describe('AnimatedBox', () => {
  it('has correct defaults', () => {
    const { getByTestId } = render(
      <AnimatedBox data-testid="TestAnimatedBox">
        <div data-testid="TestAnimatedBoxContent" />
      </AnimatedBox>,
    );
    expect(getByTestId('TestAnimatedBox')).toBeInTheDocument();
    expect(getByTestId('TestAnimatedBoxContent')).toBeInTheDocument();
  });
});
