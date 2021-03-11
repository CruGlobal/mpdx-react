import React from 'react';
import { render } from '@testing-library/react';
import { GiftStatus, GiftStatusEnum } from './GiftStatus';

describe('GiftStatus', () => {
  it('is Late', () => {
    const { getByTitle } = render(
      <GiftStatus giftStatusEnum={GiftStatusEnum.Late} />,
    );
    expect(getByTitle('Late')).toBeTruthy();
  });
  it('is On Time', () => {
    const { getByTitle } = render(
      <GiftStatus giftStatusEnum={GiftStatusEnum.OnTime} />,
    );
    expect(getByTitle('On Time')).toBeTruthy();
  });
});
