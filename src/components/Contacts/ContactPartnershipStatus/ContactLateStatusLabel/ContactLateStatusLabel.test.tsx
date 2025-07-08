import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from '../../../../theme';
import { ContactLateStatusLabel } from './ContactLateStatusLabel';

describe('ContactLateStatusLabel', () => {
  it('should render on time when both dates are in the future', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateAt="2020-02-06"
          pledgeStartDate="2020-02-04"
        />
      </ThemeProvider>,
    );

    expect(getByText('(On time)')).toBeInTheDocument();
  });

  it('should render On time if lateAt is in the future', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateAt="2020-01-17"
          pledgeStartDate="2019-12-17"
        />
      </ThemeProvider>,
    );
    expect(getByText('(On time)')).toBeInTheDocument();
  });

  it('should render 0-30 days late using pledgeStartDate when it is later', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateAt="2019-12-01"
          pledgeStartDate="2019-12-17"
        />
      </ThemeProvider>,
    );
    // Should use pledgeStartDate since it's later (46 days ago = LateMoreThirty)
    expect(getByText('(0-30 days late)')).toBeInTheDocument();
  });

  it('should render 60+ days late when lateAt and pledgeStartDate are both 60+ days in the past', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateAt="2019-05-017"
          pledgeStartDate="2019-05-17"
        />
      </ThemeProvider>,
    );
    expect(getByText('(60+ days late)')).toBeInTheDocument();
  });

  it('should render more than 60 days late', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateAt="2019-11-01"
          pledgeStartDate="2019-10-01"
        />
      </ThemeProvider>,
    );
    expect(getByText('(60+ days late)')).toBeInTheDocument();
  });

  it('should work when only lateAt is provided', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel lateAt="2020-01-17" />
      </ThemeProvider>,
    );

    expect(getByText('(On time)')).toBeInTheDocument();
  });

  it('should work with only pledgeStartDate is provided', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel pledgeStartDate="2019-12-17" />
      </ThemeProvider>,
    );

    expect(getByText('(0-30 days late)')).toBeInTheDocument();
  });

  it('should work when pledgeStartDate is null', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel lateAt="2020-01-17" pledgeStartDate={null} />
      </ThemeProvider>,
    );

    expect(getByText('(On time)')).toBeInTheDocument();
  });

  it('should work when lateAt is null', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel lateAt={null} pledgeStartDate="2019-12-17" />
      </ThemeProvider>,
    );

    expect(getByText('(0-30 days late)')).toBeInTheDocument();
  });
});
