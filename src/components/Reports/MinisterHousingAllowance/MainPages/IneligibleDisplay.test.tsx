import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { HcmDataQuery } from '../../Shared/HcmData/HCMData.generated';
import {
  marriedBothIneligible,
  marriedSpouseIneligible,
  marriedUserIneligible,
  singleIneligible,
} from '../../Shared/HcmData/mockData';
import { MinistryHousingAllowanceRequestsQuery } from '../MinisterHousingAllowance.generated';
import { MinisterHousingAllowanceProvider } from '../Shared/Context/MinisterHousingAllowanceContext';
import { IneligibleDisplay } from './IneligibleDisplay';

interface TestComponentProps {
  hcmMock: HcmDataQuery['hcm'];
}

const TestComponent: React.FC<TestComponentProps> = ({ hcmMock }) => {
  return (
    <ThemeProvider theme={theme}>
      <TestRouter>
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
                nodes: [],
              },
            },
          }}
        >
          <MinisterHousingAllowanceProvider>
            <IneligibleDisplay />
          </MinisterHousingAllowanceProvider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('IneligibleDisplay', () => {
  it('should render page with single ineligible staff', async () => {
    const { findByRole, findByText, findByTestId } = render(
      <TestComponent hcmMock={singleIneligible} />,
    );

    expect(
      await findByRole('heading', { name: 'Your MHA' }),
    ).toBeInTheDocument();
    expect(
      await findByText(
        /our records indicate that you have not applied for minister's housing allowance/i,
      ),
    ).toBeInTheDocument();
    expect(await findByTestId('user-ineligible-message')).toBeInTheDocument();
  });

  it('should render page with married staff and ineligible spouse', async () => {
    const { findByRole, findByTestId, queryByTestId } = render(
      <TestComponent hcmMock={marriedSpouseIneligible} />,
    );

    expect(
      await findByRole('heading', { name: 'Your MHA' }),
    ).toBeInTheDocument();
    expect(await findByTestId('spouse-ineligible-message')).toBeInTheDocument();
    expect(queryByTestId('user-ineligible-message')).not.toBeInTheDocument();
  });

  it('should render page with married staff and ineligible user', async () => {
    const { findByTestId, queryByTestId } = render(
      <TestComponent hcmMock={marriedUserIneligible} />,
    );

    expect(await findByTestId('user-ineligible-message')).toBeInTheDocument();
    expect(queryByTestId('spouse-ineligible-message')).not.toBeInTheDocument();
  });

  it('should render page with both married staff ineligible', async () => {
    const { findByTestId } = render(
      <TestComponent hcmMock={marriedBothIneligible} />,
    );

    expect(await findByTestId('user-ineligible-message')).toBeInTheDocument();
    expect(await findByTestId('spouse-ineligible-message')).toBeInTheDocument();
  });
});
