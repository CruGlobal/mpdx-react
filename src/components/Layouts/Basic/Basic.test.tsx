import React from 'react';
import { render } from '@testing-library/react';
import Basic from '.';

describe('Basic', () => {
  it('has correct defaults', () => {
    const { getByTestId } = render(
      <Basic>
        <div data-testid="PrimaryTestChildren"></div>
      </Basic>,
    );
    expect(getByTestId('PrimaryTestChildren')).toBeInTheDocument();
  });
});
