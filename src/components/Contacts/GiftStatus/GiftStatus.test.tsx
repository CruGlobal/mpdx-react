import React from 'react';
import { render } from '@testing-library/react';
import { GiftStatus, GiftStatusEnum } from './GiftStatus';

describe('GiftStatus', () => {
  it('is Late', () => {
    const { getByTitle } = render(<GiftStatus status={GiftStatusEnum.Late} />);
    expect(getByTitle('Late')).toBeVisible();
  });
  it('is On Time', () => {
    const { getByTitle } = render(
      <GiftStatus status={GiftStatusEnum.OnTime} />,
    );
    expect(getByTitle('On Time')).toBeVisible();
  });
  it('is hidden', () => {
    const { queryByTitle } = render(
      <GiftStatus status={GiftStatusEnum.Hidden} />,
    );
    expect(queryByTitle('On Time')).toBeNull();
    expect(queryByTitle('Late')).toBeNull();
  });
});
