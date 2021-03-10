import React from 'react';
import { render } from '@testing-library/react';
import { GiftStatus, GiftStatusEnum } from './giftStatus';

describe('GiftStatus', () => {
  it('is Hidden', () => {
    const { getByTitle } = render(
      <GiftStatus giftStatusEnum={GiftStatusEnum.Hidden} />,
    );
    expect(getByTitle('giftStatusHidden')).toBeTruthy();
  });
  it('is Late', () => {
    const { getByTitle } = render(
      <GiftStatus giftStatusEnum={GiftStatusEnum.Late} />,
    );
    expect(getByTitle('giftStatusLate')).toBeTruthy();
  });
  it('is On Time', () => {
    const { getByTitle } = render(
      <GiftStatus giftStatusEnum={GiftStatusEnum.OnTime} />,
    );
    expect(getByTitle('giftStatusOnTime')).toBeTruthy();
  });
});
