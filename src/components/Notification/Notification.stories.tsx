import React, { ReactElement } from 'react';
import { Notification } from './Notification';

export default {
  title: 'Notification',
};

export const Default = (): ReactElement => (
  <Notification type="info" message="No Data" />
);

export const Error = (): ReactElement => (
  <Notification type="error" message="Something went bad" />
);
