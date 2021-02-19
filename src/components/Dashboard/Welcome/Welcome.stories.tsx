import React, { ReactElement } from 'react';
import Welcome from '.';

export default {
  title: 'Dashboard/Welcome',
};

export const Default = (): ReactElement => {
  return <Welcome firstName="Bob" />;
};

export const Empty = (): ReactElement => {
  return <Welcome />;
};
