import React from 'react';
import userEvent from '@testing-library/user-event';
import * as nextRouter from 'next/router';
import { render } from '../../../../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import NavMenu from './NavMenu';

describe('NavMenu', () => {
  const useRouter = jest.spyOn(nextRouter, 'useRouter');

  beforeEach(() => {
    (useRouter as jest.SpyInstance<
      Pick<nextRouter.NextRouter, 'query' | 'isReady'>
    >).mockImplementation(() => ({
      query: { accountListId: 'accountListId' },
      isReady: true,
    }));
  });
  it('default', () => {
    const { getByRole, getByTestId } = render(
      <TestWrapper>
        <NavMenu />
      </TestWrapper>,
    );
    expect(
      getByRole('menuitem', { hidden: true, name: 'Dashboard' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Contacts' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Reports' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Tools' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Coaches' }),
    ).toBeInTheDocument();
    userEvent.click(getByTestId('ReportMenuToggle'));
    expect(
      getByRole('menuitem', { hidden: true, name: 'Donations' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Donations' }),
    ).toBeVisible();
    expect(
      getByRole('menuitem', {
        hidden: true,
        name: 'Month Report (Partner Currency)',
      }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', {
        hidden: true,
        name: 'Month Report (Salary Currency)',
      }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Designation Accounts' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Responsibility Centers' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Expected Monthly Total' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Partner Giving Analysis' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Coaching' }),
    ).toBeInTheDocument();
    userEvent.click(getByTestId('ToolsMenuToggle'));
    expect(
      getByRole('menuitem', { hidden: true, name: 'Appeal' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Fix Commitment Info' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Fix Mailing Addresses' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Fix Send Newsletter' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Merge Contacts' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Fix Email Addresses' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Fix Phone Numbers' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Merge People' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Import from Google' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Import from TntConnect' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Import from CSV' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Donations' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', {
        hidden: true,
        name: 'Month Report (Partner Currency)',
      }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', {
        hidden: true,
        name: 'Month Report (Salary Currency)',
      }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Designation Accounts' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Responsibility Centers' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Expected Monthly Total' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Partner Giving Analysis' }),
    ).not.toBeVisible();
    expect(
      getByRole('menuitem', { hidden: true, name: 'Coaching' }),
    ).not.toBeVisible();
    expect(getByTestId('appeals-false')).toBeInTheDocument();
  });

  it('hidden', () => {
    (useRouter as jest.SpyInstance<
      Pick<nextRouter.NextRouter, 'query' | 'isReady'>
    >).mockImplementation(() => ({
      query: { accountListId: '' },
      isReady: true,
    }));

    const { queryByRole } = render(
      <TestWrapper>
        <NavMenu />
      </TestWrapper>,
    );
    expect(queryByRole('menuitem')).toBeNull();
  });

  it('test current tool id hook', () => {
    (useRouter as jest.SpyInstance).mockImplementation(() => ({
      query: { accountListId: 'test' },
      isReady: true,
      pathname: '/accountLists/test/tools/appeals',
    }));

    const { getByTestId } = render(
      <TestWrapper>
        <NavMenu />
      </TestWrapper>,
    );
    userEvent.click(getByTestId('ToolsMenuToggle'));
    expect(getByTestId('appeals-true')).toBeInTheDocument();
  });
});
