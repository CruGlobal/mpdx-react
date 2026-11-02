import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoadErrorAlert } from './LoadErrorAlert';

describe('LoadErrorAlert', () => {
  it('shows the message in an error alert', () => {
    const { getByRole } = render(
      <LoadErrorAlert
        message="The report could not be loaded."
        onRetry={jest.fn()}
      />,
    );

    expect(getByRole('alert')).toHaveTextContent(
      'The report could not be loaded.',
    );
  });

  it('calls onRetry when Try Again is clicked', () => {
    const onRetry = jest.fn();
    const { getByRole } = render(
      <LoadErrorAlert
        message="The report could not be loaded."
        onRetry={onRetry}
      />,
    );

    userEvent.click(getByRole('button', { name: 'Try Again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
