import React from 'react';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import { GiftStatus } from './GiftStatus';

describe('GiftStatus', () => {
  it('is Late', () => {
    const { getByTitle } = render(
      <GiftStatus lateAt={DateTime.now().minus({ day: 1 }).toISO()} />,
    );
    expect(getByTitle('Late')).toBeVisible();
  });
  it('is On Time', () => {
    const { getByTitle } = render(
      <GiftStatus lateAt={DateTime.now().toISO()} />,
    );
    expect(getByTitle('On Time')).toBeVisible();
  });
  it('is hidden', () => {
    const { queryByTitle } = render(<GiftStatus lateAt={undefined} />);
    expect(queryByTitle('On Time')).toBeNull();
    expect(queryByTitle('Late')).toBeNull();
  });
});
