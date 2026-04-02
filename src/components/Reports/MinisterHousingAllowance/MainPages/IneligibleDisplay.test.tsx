import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import {
  marriedBothIneligible,
  marriedUserEligibleSpouseIneligible,
  marriedUserIneligibleSpouseEligible,
  singleIneligible,
} from '../../Shared/HcmData/mockData';
import {
  ContextType,
  HcmData,
  MinisterHousingAllowanceContext,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { IneligibleDisplay } from './IneligibleDisplay';

const withCountry = (hcmData: HcmData, country: string): HcmData => ({
  ...hcmData,
  staffInfo: { ...hcmData.staffInfo, country },
});

interface TestComponentProps {
  contextValue: Partial<ContextType>;
}

const TestComponent: React.FC<TestComponentProps> = ({ contextValue }) => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <MinisterHousingAllowanceContext.Provider
          value={contextValue as ContextType}
        >
          <IneligibleDisplay />
        </MinisterHousingAllowanceContext.Provider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

describe('IneligibleDisplay', () => {
  it('should render single user ineligible message', () => {
    const { getByTestId } = render(
      <TestComponent
        contextValue={{
          isMarried: false,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userEligibleForMHA: false,
          spouseEligibleForMHA: false,
          userHcmData: singleIneligible[0],
        }}
      />,
    );

    expect(getByTestId('single-ineligible')).toBeInTheDocument();
  });

  it('should render Italy message for single user from Italy', () => {
    const { getByTestId } = render(
      <TestComponent
        contextValue={{
          isMarried: false,
          preferredName: 'John',
          spousePreferredName: '',
          userEligibleForMHA: false,
          spouseEligibleForMHA: false,
          userHcmData: withCountry(singleIneligible[0], 'IT'),
        }}
      />,
    );

    expect(getByTestId('mhi-ineligible')).toBeInTheDocument();
  });

  it('should render both ineligible message when neither user is eligible', () => {
    const { getByTestId } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userEligibleForMHA: false,
          spouseEligibleForMHA: false,
          userHcmData: marriedBothIneligible[0],
          spouseHcmData: marriedBothIneligible[1],
        }}
      />,
    );

    expect(getByTestId('both-ineligible')).toBeInTheDocument();
  });

  it('should render MHI message when both ineligible and both from Italy', () => {
    const { getByTestId } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userEligibleForMHA: false,
          spouseEligibleForMHA: false,
          userHcmData: withCountry(marriedBothIneligible[0], 'IT'),
          spouseHcmData: withCountry(marriedBothIneligible[1], 'IT'),
        }}
      />,
    );

    expect(getByTestId('mhi-ineligible')).toBeInTheDocument();
  });

  it('should render mixed message when both ineligible and user is from Italy', () => {
    const { getByTestId, getByText } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userEligibleForMHA: false,
          spouseEligibleForMHA: false,
          userHcmData: withCountry(marriedBothIneligible[0], 'IT'),
          spouseHcmData: marriedBothIneligible[1],
        }}
      />,
    );

    expect(getByTestId('both-ineligible-mixed')).toBeInTheDocument();
    expect(getByText(/must fill out an MHI form/)).toBeInTheDocument();
    expect(getByText(/has not completed the required IBS/)).toBeInTheDocument();
  });

  it('should render mixed message when both ineligible and spouse is from Italy', () => {
    const { getByTestId, getByText } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userEligibleForMHA: false,
          spouseEligibleForMHA: false,
          userHcmData: marriedBothIneligible[0],
          spouseHcmData: withCountry(marriedBothIneligible[1], 'IT'),
        }}
      />,
    );

    expect(getByTestId('both-ineligible-mixed')).toBeInTheDocument();
    expect(getByText(/must fill out an MHI form/)).toBeInTheDocument();
    expect(getByText(/has not completed the required IBS/)).toBeInTheDocument();
  });

  it('should render user ineligible message when user ineligible', () => {
    const { getByTestId } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userEligibleForMHA: false,
          spouseEligibleForMHA: true,
          userHcmData: marriedUserIneligibleSpouseEligible[0],
          spouseHcmData: marriedUserIneligibleSpouseEligible[1],
        }}
      />,
    );

    expect(getByTestId('one-ineligible')).toBeInTheDocument();
  });

  it('should render Italy message when one spouse is ineligible and from Italy', () => {
    const { getByTestId } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userEligibleForMHA: true,
          spouseEligibleForMHA: false,
          userHcmData: marriedUserEligibleSpouseIneligible[0],
          spouseHcmData: withCountry(
            marriedUserEligibleSpouseIneligible[1],
            'IT',
          ),
        }}
      />,
    );

    expect(getByTestId('one-mhi-ineligible')).toBeInTheDocument();
  });

  it('should render spouse ineligible message when spouse ineligible', () => {
    const { getByTestId } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userEligibleForMHA: true,
          spouseEligibleForMHA: false,
          userHcmData: marriedUserEligibleSpouseIneligible[0],
          spouseHcmData: marriedUserEligibleSpouseIneligible[1],
        }}
      />,
    );

    expect(getByTestId('one-ineligible')).toBeInTheDocument();
  });
});
