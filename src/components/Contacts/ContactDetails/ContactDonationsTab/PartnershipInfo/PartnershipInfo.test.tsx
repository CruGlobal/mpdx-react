import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import theme from '../../../../../theme';
import { PartnershipInfo } from './PartnershipInfo';
import { UserOrganizationAccountsQuery } from './PartnershipInfo.generated';
import {
  contactEmptyMock,
  contactMock,
  organizationAccountsMock,
  organizationAccountsWithCruSwitzerlandMock,
} from './PartnershipInfoMocks';

const mutationSpy = jest.fn();

interface ComponentsProps {
  useEmptyMock?: boolean;
  includeCruSwitzerland?: boolean;
}

const Components = ({
  useEmptyMock = false,
  includeCruSwitzerland = false,
}: ComponentsProps) => (
  <SnackbarProvider>
    <TestRouter>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider<{
            UserOrganizationAccounts: UserOrganizationAccountsQuery;
          }>
            mocks={{
              UserOrganizationAccounts: includeCruSwitzerland
                ? organizationAccountsWithCruSwitzerlandMock
                : organizationAccountsMock,
            }}
            onCall={mutationSpy}
          >
            <PartnershipInfo
              contact={useEmptyMock ? contactEmptyMock : contactMock}
            />
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('PartnershipInfo', () => {
  it('test renderer', () => {
    const { getByText } = render(<Components />);

    expect(getByText('CA$55 - Annual')).toBeInTheDocument();
    expect(getByText('Partner - Financial')).toBeInTheDocument();
  });

  it('renders No Status', () => {
    const { getByText } = render(<Components useEmptyMock />);

    expect(getByText('No Status')).toBeInTheDocument();
  });

  it('should not render relationship code', async () => {
    const { queryByText } = render(<Components />);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('UserOrganizationAccounts');
    });
    expect(queryByText('Relationship Code')).not.toBeInTheDocument();
  });

  it('should render relationship code', async () => {
    const { findByText } = render(<Components includeCruSwitzerland />);

    expect(await findByText('Relationship Code')).toBeInTheDocument();
  });

  it('should open edit partnership information modal', () => {
    const { getByText, getByLabelText } = render(<Components />);

    userEvent.click(getByLabelText('Edit Icon'));
    expect(getByText('Edit Partnership')).toBeInTheDocument();
  });

  it('should close edit partnership information modal', async () => {
    const { getByText, getByLabelText, queryByText } = render(<Components />);

    userEvent.click(getByLabelText('Edit Icon'));
    expect(getByText('Edit Partnership')).toBeInTheDocument();
    userEvent.click(getByLabelText('Close'));
    await waitFor(() =>
      expect(queryByText('Edit Partnership')).not.toBeInTheDocument(),
    );
  });
});
