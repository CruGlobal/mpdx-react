import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { HcmDataQuery } from 'src/components/Reports/Shared/HcmData/HCMData.generated';
import { singleNoMhaNoException } from 'src/components/Reports/Shared/HcmData/mockData';
import theme from 'src/theme';
import { MinisterHousingAllowanceProvider } from '../../../Shared/Context/MinisterHousingAllowanceContext';
import { PersonInfo } from './PersonInfo';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{
      HcmData: HcmDataQuery;
    }>
      mocks={{
        HcmData: {
          hcm: singleNoMhaNoException,
        },
      }}
    >
      <MinisterHousingAllowanceProvider>
        <TestRouter>
          <PersonInfo />
        </TestRouter>
      </MinisterHousingAllowanceProvider>
    </GqlMockedProvider>
  </ThemeProvider>
);

describe('PersonInfo', () => {
  it('renders personal contact information', async () => {
    const { findByText, getByText } = render(<TestComponent />);

    expect(getByText('Personal Contact Information')).toBeInTheDocument();

    expect(await findByText('John Doe')).toBeInTheDocument();
    expect(
      await findByText('Staff Account Number: 000123456'),
    ).toBeInTheDocument();
    expect(await findByText(/100 Lake Hart Dr/i)).toBeInTheDocument();
    expect(await findByText(/Orlando, FL 32832/i)).toBeInTheDocument();
    expect(await findByText('Email: john.doe@cru.org')).toBeInTheDocument();
    expect(await findByText('Phone number: 1234567890')).toBeInTheDocument();
  });
});
