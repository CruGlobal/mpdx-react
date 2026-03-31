import React from 'react';
import { render } from '@testing-library/react';
import { PdsGoalsListWelcome } from './PdsGoalsListWelcome';

describe('PdsGoalsListWelcome', () => {
  it('renders a welcome message with the user name', () => {
    const { getByText } = render(<PdsGoalsListWelcome firstName="John" />);

    expect(
      getByText(
        'Welcome to the Paid with Designation Support Goal Calculator.',
      ),
    ).toBeInTheDocument();
  });
});
