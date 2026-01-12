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
  marriedMhaAndNoException,
  marriedSpouseIneligible,
  singleIneligible,
  singleMhaNoException,
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

  it('renders married with ineligible spouse, no approved requests', async () => {
    const { findByText } = render(
      <TestComponent hcmMock={marriedSpouseIneligible} mhaRequestsMock={[]} />,
    );

    expect(
      await findByText(/our records indicate that you have not applied for/i),
    ).toBeInTheDocument();
    expect(
      await findByText(/will submit the request for john. jane has not/i),
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

  describe('Create MHA Request Eligibility', () => {
    it('should allow create mutation when user is eligible', async () => {
      const { findByText, getByRole } = render(
        <TestComponent hcmMock={singleMhaNoException} mhaRequestsMock={[]} />,
      );

      // Wait for data to load
      await findByText('John Doe');

      const button = getByRole('button', { name: 'Request New MHA' });
      expect(button).toBeEnabled();

      userEvent.click(button);

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation(
          'CreateHousingAllowanceRequest',
        ),
      );
    });

    it('should block create mutation when user is not eligible', async () => {
      const { getByRole, findByText } = render(
        <TestComponent hcmMock={singleIneligible} mhaRequestsMock={[]} />,
      );

      await findByText('John Doe');

      const button = getByRole('button', { name: 'Request New MHA' });
      userEvent.click(button);

      // Should show error message and not trigger mutation
      expect(
        await findByText(
          'You are not eligible to make changes to this request.',
        ),
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(mutationSpy).not.toHaveGraphqlOperation(
          'CreateHousingAllowanceRequest',
        );
      });
    });
  });
});
