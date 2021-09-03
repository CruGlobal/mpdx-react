import React from 'react';
import userEvent from '@testing-library/user-event';
import * as nextRouter from 'next/router';
import { ThemeProvider } from '@material-ui/styles';
import { render } from '../../../../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import NavMenu from './NavMenu';
import theme from 'src/theme';

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
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <NavMenu />
        </TestWrapper>
        ,
      </ThemeProvider>,
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
  });

  it('hidden', () => {
    (useRouter as jest.SpyInstance<
      Pick<nextRouter.NextRouter, 'query' | 'isReady'>
    >).mockImplementation(() => ({
      query: { accountListId: '' },
      isReady: true,
    }));

    const { queryByRole } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <NavMenu />
        </TestWrapper>
        ,
      </ThemeProvider>,
    );
    expect(queryByRole('menuitem')).toBeNull();
  });
});
