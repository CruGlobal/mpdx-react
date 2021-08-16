import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@material-ui/core';
import { ResponsibilityCentersReport } from './ResponsibilityCentersReport';
import {
  financialAccountsEmptyMock,
  financialAccountsErrorMock,
  financialAccountsLoadingMock,
  financialAccountsMock,
} from './ResponsibilityCentersReport.mock';
import theme from 'src/theme';

const accountListId = '111';
const title = 'test title';
const onNavListToggle = jest.fn();

describe('FinancialAccounts', () => {
  it('default', async () => {
    const { queryByTestId, getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider
          mocks={[financialAccountsMock(accountListId)]}
          addTypename={false}
        >
          <ResponsibilityCentersReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </MockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(queryByTestId('LoadingFinancialAccounts')).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText('CA$3,500')).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
    expect(getByTestId('AccountsGroupList')).toBeInTheDocument();
    expect(getByTestId('ResponsibilityCentersScrollBox')).toBeInTheDocument();
  });

  it('loading', async () => {
    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider
          mocks={[financialAccountsLoadingMock(accountListId)]}
          addTypename={false}
        >
          <ResponsibilityCentersReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </MockedProvider>
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(queryByTestId('LoadingResponsibilityCenters')).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
  });

  it('empty', async () => {
    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider
          mocks={[financialAccountsEmptyMock(accountListId)]}
          addTypename={false}
        >
          <ResponsibilityCentersReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </MockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingResponsibilityCenters'),
      ).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(queryByTestId('EmptyReport')).toBeInTheDocument();
  });

  it('error', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider
          mocks={[financialAccountsErrorMock(accountListId)]}
          addTypename={false}
        >
          <ResponsibilityCentersReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </MockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingResponsibilityCenters'),
      ).not.toBeInTheDocument();
    });

    expect(queryByTestId('Notification')).toBeInTheDocument();
  });
});
