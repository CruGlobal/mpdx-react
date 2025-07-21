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

  it('should render 0-30 days late using pledgeStartDate when it is later and within 30 days', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateAt="2019-12-01"
          pledgeStartDate="2019-12-17"
        />
      </ThemeProvider>,
    );
    expect(getByText('(0-30 days late)')).toBeInTheDocument();
  });

  it('should render 30-60 days late when it is later within 30-60 days', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateAt="2019-11-10"
          pledgeStartDate="2019-11-17"
        />
      </ThemeProvider>,
    );
    expect(getByText('(30-60 days late)')).toBeInTheDocument();
  });

  it('should render 60+ days late when lateAt and pledgeStartDate are both 60+ days in the past', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateAt="2019-05-17"
          pledgeStartDate="2019-05-17"
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

  it('should work when pledgeStartDate is null', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel lateAt="2020-01-17" pledgeStartDate={null} />
      </ThemeProvider>,
    );

    expect(getByText('(On time)')).toBeInTheDocument();
  });

  it('should not render when pledgeStart is provided without lateAt', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel
          lateAt={null}
          pledgeStartDate="2019-12-17"
          pledgeFrequency={null}
        />
      </ThemeProvider>,
    );

    expect(queryByText('(0-30 days late)')).not.toBeInTheDocument();
  });

  it('should not render when both lateAt and pledgeStartDate are null', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <ContactLateStatusLabel lateAt={null} pledgeStartDate={null} />
      </ThemeProvider>,
    );
    expect(queryByText('(On time)')).not.toBeInTheDocument();
    expect(queryByText('(0-30 days late)')).not.toBeInTheDocument();
    expect(queryByText('(30-60 days late)')).not.toBeInTheDocument();
    expect(queryByText('(60+ days late)')).not.toBeInTheDocument();
  });
});
