import React from 'react';
import { render } from '@testing-library/react';
import { GiftStatus, GiftStatusEnum } from './giftStatus';

describe('GiftStatus', () => {
  it('is Hidden', () => {
    const { queryByTestId } = render(
      <GiftStatus giftStatusEnum={GiftStatusEnum.Hidden} />,
    );
    expect(queryByTestId('giftStatusLate')).toBeNull();
    expect(queryByTestId('giftStatusOnTime')).toBeNull();
  });
  it('is Late', () => {
    const { queryByTestId } = render(
      <GiftStatus giftStatusEnum={GiftStatusEnum.Late} />,
    );
    expect(queryByTestId('giftStatusHidden')).toBeNull();
    expect(queryByTestId('giftStatusOnTime')).toBeNull();
  });
  it('is On Time', () => {
    const { queryByTestId } = render(
      <GiftStatus giftStatusEnum={GiftStatusEnum.OnTime} />,
    );
    expect(queryByTestId('giftStatusHidden')).toBeNull();
    expect(queryByTestId('giftStatusLate')).toBeNull();
  });
});
