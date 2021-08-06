import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@material-ui/core';
import { DesignationAccountsReport } from './DesignationAccountsReport';
import {
  designationAccountsEmptyMock,
  designationAccountsLoadingMock,
  designationAccountsMock,
} from './DesignationAccountsReport.mock';
import theme from 'src/theme';

const accountListId = '111';
const title = 'test title';
const onNavListToggle = jest.fn();

describe('DesignationAccounts', () => {
  it('default', async () => {
    const { queryByTestId, getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider
          mocks={[designationAccountsMock(accountListId)]}
          addTypename={false}
        >
          <DesignationAccountsReport
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
        queryByTestId('LoadingDesignationAccounts'),
      ).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
    expect(getByTestId('DesignationAccountsGroupList')).toBeInTheDocument();
    expect(getByTestId('DesignationAccountsScrollBox')).toBeInTheDocument();
  });

  it('loading', async () => {
    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider
          mocks={[designationAccountsLoadingMock(accountListId)]}
          addTypename={false}
        >
          <DesignationAccountsReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </MockedProvider>
      </ThemeProvider>,
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(queryByTestId('LoadingDesignationAccounts')).toBeInTheDocument();
    expect(queryByTestId('Notification')).not.toBeInTheDocument();
  });

  it('empty', async () => {
    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <MockedProvider
          mocks={[designationAccountsEmptyMock(accountListId)]}
          addTypename={false}
        >
          <DesignationAccountsReport
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
        queryByTestId('LoadingDesignationAccounts'),
      ).not.toBeInTheDocument();
    });

    expect(getByText(title)).toBeInTheDocument();
    expect(queryByTestId('EmptyReport')).toBeInTheDocument();
  });
});
