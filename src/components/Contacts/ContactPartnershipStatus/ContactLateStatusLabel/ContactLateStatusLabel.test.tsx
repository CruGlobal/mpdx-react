import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from '../../../../theme';
import {
  ContactLateStatusLabel,
  ContactLateStatusEnum,
} from './ContactLateStatusLabel';

describe('ContactLateStatusLabel', () => {
  it('should render on time', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel lateStatusEnum={ContactLateStatusEnum.OnTime} />
      </ThemeProvider>,
    );

    expect(getByText('(On time)')).toBeInTheDocument();
  });

  it('should render less than 30 days late', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateStatusEnum={ContactLateStatusEnum.LateLessThirty}
        />
      </ThemeProvider>,
    );

    expect(getByText('(0-30 days late)')).toBeInTheDocument();
  });
  it('should render 30 to 60 days late', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateStatusEnum={ContactLateStatusEnum.LateMoreThirty}
        />
      </ThemeProvider>,
    );

    expect(getByText('(30-60 days late)')).toBeInTheDocument();
  });
  it('should render more than 60 days late', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateStatusEnum={ContactLateStatusEnum.LateMoreSixty}
        />
      </ThemeProvider>,
    );

    expect(getByText('(60+ days late)')).toBeInTheDocument();
  });
});
