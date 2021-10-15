import React from 'react';
import { MuiThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import theme from '../../../../theme';
import {
  ContactLateStatusLabel,
  ContactLateStatusEnum,
} from './ContactLateStatusLabel';

const onTimeDate = ContactLateStatusEnum.OnTime;
const lateDate = ContactLateStatusEnum.LateLessThirty;

describe('ContactLateStatusLabel', () => {
  it('on time', () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ContactLateStatusLabel lateStatusEnum={onTimeDate} />
      </MuiThemeProvider>,
    );

    expect(getByText('(On time)')).toBeInTheDocument();
  });

  it('is late less than 30 days', () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ContactLateStatusLabel lateStatusEnum={lateDate} />
      </MuiThemeProvider>,
    );

    expect(getByText('(0-30 days late)')).toBeInTheDocument();
  });
});
