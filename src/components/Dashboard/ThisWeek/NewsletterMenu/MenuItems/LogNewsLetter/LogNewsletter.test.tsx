import React from 'react';
import { render } from '@testing-library/react';
import LogNewsletter from './LogNewsletter';

const accountListId = '111';
const handleClose = jest.fn();

describe('LogNewsletter', () => {
  it('default', () => {
    const { queryByText } = render(
      <LogNewsletter accountListId={accountListId} handleClose={handleClose} />,
    );
    expect(queryByText('Log Newsletter')).toBeInTheDocument();
  });
});
