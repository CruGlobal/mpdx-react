import React from 'react';
import { MuiThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import theme from '../../../../theme';
import {
  ContactLateStatusLabel,
  ContactLateStatusEnum,
} from './ContactLateStatusLabel';

describe('ContactLateStatusLabel', () => {
  it('should render on time', () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ContactLateStatusLabel lateStatusEnum={ContactLateStatusEnum.OnTime} />
      </MuiThemeProvider>,
    );

    expect(getByText('(On time)')).toBeInTheDocument();
  });

  it('should render less than 30 days late', () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateStatusEnum={ContactLateStatusEnum.LateLessThirty}
        />
      </MuiThemeProvider>,
    );

    expect(getByText('(0-30 days late)')).toBeInTheDocument();
  });
  it('should render 30 to 60 days late', () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateStatusEnum={ContactLateStatusEnum.LateMoreThirty}
        />
      </MuiThemeProvider>,
    );

    expect(getByText('(30-60 days late)')).toBeInTheDocument();
  });
  it('should render more than 60 days late', () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateStatusEnum={ContactLateStatusEnum.LateMoreSixty}
        />
      </MuiThemeProvider>,
    );

    expect(getByText('(60+ days late)')).toBeInTheDocument();
  });
});
