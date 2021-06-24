import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import NavMenu from './NavMenu';

describe('NavMenu', () => {
  it('default', () => {
    const { getByRole, getByTestId } = render(
      <TestWrapper initialState={{ accountListId: '1' }}>
        <NavMenu />
      </TestWrapper>,
    );
    expect(getByRole('menuitem', { name: 'Dashboard' })).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Contacts' })).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Reports' })).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Tools' })).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Coaches' })).toBeInTheDocument();
    userEvent.click(getByTestId('ReportMenuToggle'));
    expect(getByRole('menuitem', { name: 'Donations' })).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Month Report (Partner Currency)' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Month Report (Salary Currency)' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Designation Accounts' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Responsibility Centers' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Expected Monthly Total' }),
    ).toBeInTheDocument();
    expect(
      getByRole('menuitem', { name: 'Partner Giving Analysis' }),
    ).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Coaching' })).toBeInTheDocument();
  });

  it('hidden', () => {
    const { queryByRole } = render(
      <TestWrapper initialState={{}}>
        <NavMenu />
      </TestWrapper>,
    );
    expect(queryByRole('menuitem')).toBeNull();
  });
});
