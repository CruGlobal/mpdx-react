import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MhaStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { HcmDataMarriedQuery } from '../Shared/HcmData/HCMData.generated';
import {
  marriedMhaAndNoException,
  marriedNoMhaNoException,
  singleMhaNoException,
  singleNoMhaNoException,
} from '../Shared/HcmData/mockData';
import { MinisterHousingAllowanceReport } from './MinisterHousingAllowance';
import { MinistryHousingAllowanceRequestsQuery } from './MinisterHousingAllowance.generated';
import { MinisterHousingAllowanceProvider } from './Shared/Context/MinisterHousingAllowanceContext';
import { mockMHARequest } from './mockData';

interface TestComponentProps {
  hcmMock: HcmDataMarriedQuery['hcm'];
  mhaRequestsMock: MinistryHousingAllowanceRequestsQuery['ministryHousingAllowanceRequests']['nodes'];
}

const TestComponent: React.FC<TestComponentProps> = ({
  hcmMock,
  mhaRequestsMock,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <SnackbarProvider>
        <GqlMockedProvider<{
          HcmDataMarried: HcmDataMarriedQuery;
          MinistryHousingAllowanceRequests: MinistryHousingAllowanceRequestsQuery;
        }>
          mocks={{
            HcmDataMarried: {
              hcm: hcmMock,
            },
            MinistryHousingAllowanceRequests: {
              ministryHousingAllowanceRequests: {
                nodes: mhaRequestsMock,
              },
            },
          }}
        >
          <MinisterHousingAllowanceProvider>
            <MinisterHousingAllowanceReport />
          </MinisterHousingAllowanceProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('MinisterHousingAllowanceReport', () => {
  it('renders single, no pending, no approved correctly', async () => {
    const { findByText } = render(
      <TestComponent hcmMock={singleNoMhaNoException} mhaRequestsMock={[]} />,
    );

    expect(
      await findByText(/our records indicate that you have not applied for/i),
    ).toBeInTheDocument();
    expect(await findByText('John')).toBeInTheDocument();
  });

  it('renders married, no pending, no approved correctly', async () => {
    const { findByText } = render(
      <TestComponent hcmMock={marriedNoMhaNoException} mhaRequestsMock={[]} />,
    );

    expect(
      await findByText(/our records indicate that you have not applied for/i),
    ).toBeInTheDocument();
    expect(
      await findByText(/will submit the request for john. jane has not/i),
    ).toBeInTheDocument();
    expect(await findByText('John and Jane')).toBeInTheDocument();
  });

  it('renders married, no pending, approved correctly', async () => {
    const { findByText } = render(
      <TestComponent
        hcmMock={marriedMhaAndNoException}
        mhaRequestsMock={[
          {
            ...mockMHARequest,
            status: MhaStatusEnum.BoardApproved,
            requestAttributes: {
              ...mockMHARequest.requestAttributes,
              spouseSpecific: 5000,
              staffSpecific: 10000,
            },
          },
        ]}
      />,
    );

    expect(
      await findByText(/our records indicate that you have an approved/i),
    ).toBeInTheDocument();
    expect(await findByText('John and Jane')).toBeInTheDocument();

    expect(await findByText('Current Board Approved MHA')).toBeInTheDocument();
  });

  it('renders single, no pending, approved correctly', async () => {
    const { findByText, findAllByText, getByText } = render(
      <TestComponent
        hcmMock={singleMhaNoException}
        mhaRequestsMock={[
          {
            ...mockMHARequest,
            status: MhaStatusEnum.BoardApproved,
          },
        ]}
      />,
    );

    expect(
      await findByText(/our records indicate that you have an approved/i),
    ).toBeInTheDocument();
    expect(await findAllByText('John')).toHaveLength(2);

    expect(getByText('Current Board Approved MHA')).toBeInTheDocument();
  });

  it('renders married, pending, no approved correctly', async () => {
    const { findByText } = render(
      <TestComponent
        hcmMock={marriedMhaAndNoException}
        mhaRequestsMock={[
          {
            ...mockMHARequest,
            requestAttributes: {
              ...mockMHARequest.requestAttributes,
              spouseSpecific: 5000,
              staffSpecific: 10000,
            },
          },
        ]}
      />,
    );

    expect(
      await findByText(/our records indicate that you have an mha request/i),
    ).toBeInTheDocument();
    expect(await findByText('John and Jane')).toBeInTheDocument();

    expect(await findByText('Current MHA Request')).toBeInTheDocument();
  });
});
