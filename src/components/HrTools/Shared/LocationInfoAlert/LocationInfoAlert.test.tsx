import React from 'react';
import { render } from '@testing-library/react';
import { LocationInfoAlert } from './LocationInfoAlert';

describe('LocationInfoAlert', () => {
  it('renders the geographic location disclosure', () => {
    const { getByText } = render(<LocationInfoAlert />);

    expect(
      getByText(
        'This will update your default location multiplier in your account settings.',
      ),
    ).toBeInTheDocument();
  });
});
