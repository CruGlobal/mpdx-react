import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MhaStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { HcmDataQuery } from '../Shared/HcmData/HCMData.generated';
import {
  marriedBothIneligible,
  marriedBothMhi,
  marriedMhaAndNoException,
  marriedNoMhaNoException,
  marriedUserEligibleSpouseIneligible,
  marriedUserEligibleSpouseMhi,
  marriedUserIneligibleSpouseEligible,
  marriedUserMhiSpouseEligible,
  marriedUserMhiSpouseIneligible,
  singleIneligible,
  singleMhaNoException,
  singleMhi,
  singleNoMhaNoException,
} from '../Shared/HcmData/mockData';
import { MinisterHousingAllowanceReport } from './MinisterHousingAllowance';
import {
  CreateHousingAllowanceRequestMutation,
  MinistryHousingAllowanceRequestsQuery,
} from './MinisterHousingAllowance.generated';
import { MinisterHousingAllowanceProvider } from './Shared/Context/MinisterHousingAllowanceContext';
import { mockMHARequest } from './mockData';

const mutationSpy = jest.fn();
const mockPush = jest.fn();

interface TestComponentProps {
  hcmMock: HcmDataQuery['hcm'];
  mhaRequestsMock: MinistryHousingAllowanceRequestsQuery['ministryHousingAllowanceRequests']['nodes'];
}

const TestComponent: React.FC<TestComponentProps> = ({
  hcmMock,
  mhaRequestsMock,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={{ push: mockPush }}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          HcmData: HcmDataQuery;
          MinistryHousingAllowanceRequests: MinistryHousingAllowanceRequestsQuery;
          CreateHousingAllowanceRequest: CreateHousingAllowanceRequestMutation;
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
            CreateHousingAllowanceRequest: {
              createMinistryHousingAllowanceRequest: {
                ministryHousingAllowanceRequest: {
                  id: 'new-mha-id',
                },
              },
            },
          }}
          onCall={mutationSpy}
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

  it('renders married, one eligible, one ineligible with no requests', async () => {
    const { findByText, findByTestId } = render(
      <TestComponent
        hcmMock={marriedUserEligibleSpouseIneligible}
        mhaRequestsMock={[]}
      />,
    );

    expect(await findByTestId('one-ineligible')).toBeInTheDocument();
    expect(
      await findByText(/our records indicate that you have not applied for/i),
    ).toBeInTheDocument();
  });

  it('renders married, one eligible, one ineligible with approved request', async () => {
    const { findByText, findByTestId } = render(
      <TestComponent
        hcmMock={marriedUserIneligibleSpouseEligible}
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

    expect(await findByTestId('one-ineligible')).toBeInTheDocument();
    expect(
      await findByText(/our records indicate that you have an approved/i),
    ).toBeInTheDocument();
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

  it('does not render Current Request section when eligible user has no requests', async () => {
    const { queryByText, findByRole } = render(
      <TestComponent hcmMock={singleMhaNoException} mhaRequestsMock={[]} />,
    );

    expect(
      await findByRole('heading', { name: 'Your MHA' }),
    ).toBeInTheDocument();
    expect(queryByText('Current MHA Request')).not.toBeInTheDocument();
  });

  it('shows loading and calls router.push when creating a new MHA request', async () => {
    const { findByRole, findByTestId } = render(
      <TestComponent
        hcmMock={singleMhaNoException}
        mhaRequestsMock={[
          { ...mockMHARequest, status: MhaStatusEnum.BoardApproved },
        ]}
      />,
    );

    const requestButton = await findByRole('button', {
      name: 'Request New MHA',
    });
    userEvent.click(requestButton);

    expect(await findByTestId('Loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'CreateHousingAllowanceRequest',
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/accountLists/account-list-1/reports/housingAllowance/new-mha-id?mode=new',
      );
    });
  });

  it('shows success snackbar when MHA request is created', async () => {
    const { findByRole, findByText } = render(
      <TestComponent
        hcmMock={singleMhaNoException}
        mhaRequestsMock={[
          { ...mockMHARequest, status: MhaStatusEnum.BoardApproved },
        ]}
      />,
    );

    const requestButton = await findByRole('button', {
      name: 'Request New MHA',
    });
    userEvent.click(requestButton);

    expect(
      await findByText('Successfully created MHA Request.'),
    ).toBeInTheDocument();
  });

  it('renders single MHI user with IneligibleDisplay and hides NoRequestsDisplay', async () => {
    const { findByTestId, queryByTestId } = render(
      <TestComponent hcmMock={singleMhi} mhaRequestsMock={[]} />,
    );

    expect(await findByTestId('mhi-ineligible')).toBeInTheDocument();
    expect(queryByTestId('no-requests-display')).not.toBeInTheDocument();
  });

  it('renders married both MHI with IneligibleDisplay and hides NoRequestsDisplay', async () => {
    const { findByTestId, queryByTestId } = render(
      <TestComponent hcmMock={marriedBothMhi} mhaRequestsMock={[]} />,
    );

    expect(await findByTestId('mhi-ineligible')).toBeInTheDocument();
    expect(queryByTestId('no-requests-display')).not.toBeInTheDocument();
  });

  it('renders married one MHI + one eligible with both IneligibleDisplay and NoRequestsDisplay', async () => {
    const { findByTestId } = render(
      <TestComponent
        hcmMock={marriedUserMhiSpouseEligible}
        mhaRequestsMock={[]}
      />,
    );

    expect(await findByTestId('one-mhi-ineligible')).toBeInTheDocument();
    expect(await findByTestId('no-requests-display')).toBeInTheDocument();
  });

  it('renders married one eligible + one MHI spouse with both displays', async () => {
    const { findByTestId } = render(
      <TestComponent
        hcmMock={marriedUserEligibleSpouseMhi}
        mhaRequestsMock={[]}
      />,
    );

    expect(await findByTestId('one-mhi-ineligible')).toBeInTheDocument();
    expect(await findByTestId('no-requests-display')).toBeInTheDocument();
  });

  it('renders married MHI user + IBS ineligible spouse with mixed ineligible display', async () => {
    const { findByTestId, queryByTestId } = render(
      <TestComponent
        hcmMock={marriedUserMhiSpouseIneligible}
        mhaRequestsMock={[]}
      />,
    );

    expect(await findByTestId('both-ineligible-mixed')).toBeInTheDocument();
    expect(queryByTestId('no-requests-display')).not.toBeInTheDocument();
  });

  it('hides request details and Request New MHA button for single MHI user', async () => {
    const { findByTestId, queryByText, queryByRole } = render(
      <TestComponent
        hcmMock={singleMhi}
        mhaRequestsMock={[
          {
            ...mockMHARequest,
            status: MhaStatusEnum.BoardApproved,
          },
        ]}
      />,
    );

    expect(await findByTestId('mhi-ineligible')).toBeInTheDocument();
    expect(queryByText('Current Board Approved MHA')).not.toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'Request New MHA' }),
    ).not.toBeInTheDocument();
  });

  it('shows request details for married MHI user + eligible spouse with approved request', async () => {
    const { findByTestId, findByText } = render(
      <TestComponent
        hcmMock={marriedUserMhiSpouseEligible}
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

    expect(await findByTestId('one-mhi-ineligible')).toBeInTheDocument();
    expect(
      await findByText(/our records indicate that you have an approved/i),
    ).toBeInTheDocument();
    expect(await findByText('Current Board Approved MHA')).toBeInTheDocument();
  });
});
