import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MhaStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { HcmDataQuery } from '../Shared/HcmData/HCMData.generated';
import {
  marriedBothIneligible,
  marriedMhaAndNoException,
  marriedNoMhaNoException,
  singleIneligible,
  singleMhaNoException,
  singleNoMhaNoException,
} from '../Shared/HcmData/mockData';
import { MinisterHousingAllowanceReport } from './MinisterHousingAllowance';
import { MinistryHousingAllowanceRequestsQuery } from './MinisterHousingAllowance.generated';
import { MinisterHousingAllowanceProvider } from './Shared/Context/MinisterHousingAllowanceContext';
import { mockMHARequest } from './mockData';

interface TestComponentProps {
  hcmMock: HcmDataQuery['hcm'];
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
          HcmData: HcmDataQuery;
          MinistryHousingAllowanceRequests: MinistryHousingAllowanceRequestsQuery;
        }>
          mocks={{
            HcmData: {
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
    expect(await findByText('John Doe')).toBeInTheDocument();
  });

  it('renders married, no pending, no approved correctly', async () => {
    const { findByText } = render(
      <TestComponent hcmMock={marriedNoMhaNoException} mhaRequestsMock={[]} />,
    );

    expect(
      await findByText(/our records indicate that you have not applied for/i),
    ).toBeInTheDocument();
    expect(await findByText('John Doe and Jane Doe')).toBeInTheDocument();
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
    expect(await findByText('John Doe and Jane Doe')).toBeInTheDocument();

    expect(await findByText('Current Board Approved MHA')).toBeInTheDocument();
  });

  it('renders single, no pending, approved correctly', async () => {
    const { findByText, getByText } = render(
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
    expect(await findByText('John Doe')).toBeInTheDocument();

    expect(getByText('Current Board Approved MHA')).toBeInTheDocument();
  });

  it('renders fully ineligible single user with requests and hides request details', async () => {
    const { findByText, queryByText } = render(
      <TestComponent
        hcmMock={singleIneligible}
        mhaRequestsMock={[
          {
            ...mockMHARequest,
            status: MhaStatusEnum.Pending,
          },
        ]}
      />,
    );

    expect(
      await findByText(/you have not completed the required ibs courses/i),
    ).toBeInTheDocument();

    expect(
      queryByText(/our records indicate that you have an mha request/i),
    ).not.toBeInTheDocument();
  });

  it('renders fully ineligible married couple and hides request details', async () => {
    const { findByText, queryByText } = render(
      <TestComponent
        hcmMock={marriedBothIneligible}
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
      await findByText(/have not completed the required ibs courses/i),
    ).toBeInTheDocument();

    expect(queryByText('Current Board Approved MHA')).not.toBeInTheDocument();
    expect(
      queryByText(/our records indicate that you have an approved/i),
    ).not.toBeInTheDocument();
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
    expect(await findByText('John Doe and Jane Doe')).toBeInTheDocument();

    expect(await findByText('Current MHA Request')).toBeInTheDocument();
  });
});
