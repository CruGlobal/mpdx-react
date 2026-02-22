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

  it('shows ineligible spouse message when spouse has mhaEligibility false', async () => {
    // Override spouse mhaEligibility to false so the ineligible message shows
    const marriedWithIneligibleSpouse: HcmDataQuery['hcm'] = [
      marriedNoMhaNoException[0],
      {
        ...marriedNoMhaNoException[1],
        mhaEit: { mhaEligibility: false },
      },
    ];

    const { findByText } = render(
      <TestComponent
        hcmMock={marriedWithIneligibleSpouse}
        mhaRequestsMock={[]}
      />,
    );

    expect(
      await findByText(/our records indicate that you have not applied for/i),
    ).toBeInTheDocument();
    expect(
      await findByText(/will submit the request for john. jane has not/i),
    ).toBeInTheDocument();
    expect(await findByText('John Doe and Jane Doe')).toBeInTheDocument();
  });

  it('renders married, no pending, no approved without ineligible message when spouse is eligible', async () => {
    const { findByText, queryByText } = render(
      <TestComponent hcmMock={marriedNoMhaNoException} mhaRequestsMock={[]} />,
    );

    expect(
      await findByText(/our records indicate that you have not applied for/i),
    ).toBeInTheDocument();
    expect(await findByText('John Doe and Jane Doe')).toBeInTheDocument();
    expect(
      queryByText(/jane has not completed the required ibs courses/i),
    ).not.toBeInTheDocument();
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

  it('shows spouse MHA button when married and no open spouse request', async () => {
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

    expect(await findByText('Request New MHA')).toBeInTheDocument();
    expect(await findByText('Request New MHA for Jane')).toBeInTheDocument();
  });

  it('does not show spouse MHA button when single', async () => {
    const { findByText, queryByText } = render(
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

    expect(await findByText('Request New MHA')).toBeInTheDocument();
    expect(queryByText(/Request New MHA for/)).not.toBeInTheDocument();
  });
});
