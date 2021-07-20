import React from 'react';
import { render } from '@testing-library/react';
import { Notification } from './Notification';

const messageInfo = 'No Data';
const messageErr = 'Something went bad';

describe('Notification', () => {
  it('default', () => {
    const { getByTestId, queryByText } = render(
      <Notification type="info" message={messageInfo} />,
    );

    const element = getByTestId('NotificationInfoIcon');
    expect(element).toBeInTheDocument();
    expect(queryByText(messageInfo)).toBeInTheDocument();
  });

  it('error', () => {
    const { getByTestId, queryByText } = render(
      <Notification type="error" message={messageErr} />,
    );

    const element = getByTestId('NotificationErrorIcon');
    expect(element).toBeInTheDocument();
    expect(queryByText(messageErr)).toBeInTheDocument();
  });
});
