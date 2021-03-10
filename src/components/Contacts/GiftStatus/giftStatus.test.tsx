import React from 'react';
import { render } from '@testing-library/react';
import GiftStatus from './giftStatus';

describe('GiftStatus', () => {
  it('is Hidden', () => {
    const { queryByTestId } = render(
      <GiftStatus isHidden={true} isLate={false} />,
    );
    expect(queryByTestId('giftStatusLate')).toBeNull();
    expect(queryByTestId('giftStatusOnTime')).toBeNull();
  });
  it('is Late', () => {
    const { queryByTestId } = render(
      <GiftStatus isHidden={true} isLate={false} />,
    );
    expect(queryByTestId('giftStatusHidden')).toBeNull();
    expect(queryByTestId('giftStatusOnTime')).toBeNull();
  });
  it('is On Time', () => {
    const { queryByTestId } = render(
      <GiftStatus isHidden={true} isLate={false} />,
    );
    expect(queryByTestId('giftStatusHidden')).toBeNull();
    expect(queryByTestId('giftStatusLate')).toBeNull();
  });
});
